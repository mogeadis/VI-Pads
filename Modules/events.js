/**************************************************************************************************
Filename: events.js

Description: This module sets up the pointer and keyboard event handlers of the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {keyboard_keys} from "./config.js";
import {pads,touch_device} from "./device.js";
import {playAudioSample} from "./audio.js";

let pointerdown_handlers = [];
let pointerup_handlers = [];
let pointercancel_handlers = [];
let pressed_pointers = {};
let keydown_handlers = [];
let keyup_handlers = [];
let pressed_keyboard = {};
let timeouts = {};

function addEventHandlers()
{
    let event_handler = null;
    keyboard_keys.forEach((key) =>
    {
        pressed_keyboard[key] = false;
        pressed_keyboard[key.toUpperCase()] = false;
    });
    pads.forEach((pad,index) =>
    {
        pressed_pointers[index] = 0;
        event_handler = pointerdownEventHandler(pad,index);
        pad.addEventListener("pointerdown",event_handler);
        pointerdown_handlers.push(event_handler);
        event_handler = pointerupEventHandler(pad,index);
        touch_device ? pad.addEventListener("pointerup",event_handler) : document.addEventListener("pointerup",event_handler);
        pointerup_handlers.push(event_handler);
        event_handler = pointercancelEventHandler(pad,index);
        pad.addEventListener("pointercancel",event_handler);
        pointercancel_handlers.push(event_handler);
        event_handler = keydownEventHandler(pad,index);
        document.addEventListener("keydown",event_handler);
        keydown_handlers.push(event_handler);
        event_handler = keyupEventHandler(pad,index);
        document.addEventListener("keyup",event_handler);
        keyup_handlers.push(event_handler);
    });
}

function removeEventHandlers()
{
    pads.forEach((pad,index) =>
    {
        pad.removeEventListener("pointerdown",pointerdown_handlers[index]);
        touch_device ? pad.removeEventListener("pointerup",pointerup_handlers[index]) : document.removeEventListener("pointerup",pointerup_handlers[index]);
        pad.removeEventListener("pointercancel",pointercancel_handlers[index]);
        document.removeEventListener("keydown",keydown_handlers[index]);
        document.removeEventListener("keyup",keyup_handlers[index]);
    });
    pointerdown_handlers = [];
    pointerup_handlers = [];
    pointercancel_handlers = [];
    keydown_handlers = [];
    keyup_handlers = [];
}

function pointerdownEventHandler(pad,index)
{
    return function()
    {
        playAudioSample(index);
        if(timeouts[index])
        {
            clearTimeout(timeouts[index]);
            timeouts[index] = null;
        }
        pad.classList.add("active");
        pressed_pointers[index] += 1;
    }
}

function pointerupEventHandler(pad,index)
{
    return function()
    {
        if(pressed_pointers[index] > 0)
        {
            pressed_pointers[index] -= 1;
        }
        if(pressed_pointers[index] == 0)
        {
            timeouts[index] = setTimeout(() => { pad.classList.remove("active"); },25);
        }
    }
}

function pointercancelEventHandler(pad,index)
{
    
    return pointerupEventHandler(pad,index);
}

function keydownEventHandler(pad,index)
{ 
    return function(event)
    {
        const key = event.key;
        if(key === keyboard_keys[index] || key === keyboard_keys[index].toUpperCase())
        {
            if(!pressed_keyboard[key])
            {
                playAudioSample(index);
                if(timeouts[index])
                {
                    clearTimeout(timeouts[index]);
                    timeouts[index] = null;
                }
                pad.classList.add("active");
                pressed_keyboard[key] = true;
            }
        }
    }
}

function keyupEventHandler(pad,index)
{
    return function(event)
    {
        const key = event.key;
        if(key === keyboard_keys[index] || key === keyboard_keys[index].toUpperCase())
        {
            if(pressed_keyboard[key])
            {
                timeouts[index] = setTimeout(() => { pad.classList.remove("active"); },25);
                pressed_keyboard[key] = false;
            }
        }
    }
}

export {addEventHandlers,removeEventHandlers};