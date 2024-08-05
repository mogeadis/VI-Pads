/**************************************************************************************************
Filename: events.js

Description: This module sets up the pointer and keyboard event handlers of the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {keyboard_keys} from "./config.js";
import {pads} from "./device.js";
import {playAudioSample} from "./audio.js";

let pointer_handlers = [];
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
        event_handler = pointerEventHandler(pad,index);
        pad.addEventListener("pointerdown",event_handler);
        pointer_handlers.push(event_handler);
        event_handler = keydownEventHandler(pad,index);
        window.addEventListener("keydown",event_handler);
        keydown_handlers.push(event_handler);
        event_handler = keyupEventHandler();
        window.addEventListener("keyup",event_handler);
        keyup_handlers.push(event_handler);
    });
}

function removeEventHandlers()
{
    pads.forEach((pad,index) =>
    {
        pad.removeEventListener("pointerdown",pointer_handlers[index]);
        window.removeEventListener("keydown",keydown_handlers[index]);
        window.removeEventListener("keyup",keyup_handlers[index]);
    });
    pointer_handlers = [];
    keydown_handlers = [];
    keyup_handlers = [];
}

function pointerEventHandler(pad,index)
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
        timeouts[index] = setTimeout(() => { pad.classList.remove("active"); },100);
    }
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
                timeouts[index] = setTimeout(() => { pad.classList.remove("active"); },100);
                pressed_keyboard[key] = true;
            }
        }
    }
}

function keyupEventHandler()
{
    return function(event)
    {
        const key = event.key;
        pressed_keyboard[key] = false;
    }
}

export {addEventHandlers,removeEventHandlers};