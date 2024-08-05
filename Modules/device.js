/**************************************************************************************************
Filename: device.js

Description: This module sets up the virtual device functionality of the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {sounds,keyboard_keys,midi_notes} from "./config.js";
import {stopAudioSample} from "./audio.js";
import {addMIDIListeners,removeMIDIListeners,changeMIDIDevice} from "./midi.js";
import {addEventHandlers,removeEventHandlers} from "./events.js";

let pads = [];
let screen = null;
let pad_color = null;
let color_picker = null;
let color_button = null;
let power_button = null;
let device_state = null;
let touch_device = null;
let timeouts = [];

function setupDevice()
{
    installPads();
    installScreen();
    installColorButton();
    installPowerButton();
    touch_device = (("ontouchstart" in window) || (navigator.maxTouchPoints > 0));
}

function installPads()
{
    const matrix = document.querySelector(".matrix");
    sounds.forEach((sound,index) =>
    {
        const button = document.createElement("button");
        button.classList.add("pad");
        button.innerHTML = `<span class="sound">${sound.replace("_","<br>").toUpperCase()}</span>
                            <span class="key">${keyboard_keys[index].toUpperCase() + " | " + midi_notes[index]}</span>`;
        matrix.appendChild(button);
    });
    pads = document.querySelectorAll(".pad");
}

function installScreen()
{
    screen = document.getElementById("screen-text");
    screen.addEventListener("click",async () =>
    {
        if(device_state === "online")
        {
            await changeMIDIDevice();
        }
    });
}

function installColorButton()
{
    const html = document.documentElement;
    pad_color = getComputedStyle(html).getPropertyValue("--pad-color");
    color_picker = document.getElementById("color-picker");
    color_button = document.getElementById("color-button");
    color_button.addEventListener("click",() =>
    {
        let transition = getComputedStyle(color_button).transition;
        color_button.style.transition = transition.includes(", color 0.25s linear") ? transition.split(",").slice(0,-1).join(",") : transition;
    });
    color_picker.addEventListener("input",() =>
    {
        pad_color = color_picker.value;
        color_button.style.color = pad_color;
        html.style.setProperty("--pad-color",pad_color);
    });
}

function installPowerButton()
{
    power_button = document.getElementById("power-button");
    power_button.addEventListener("click",async () =>
    {
        if(device_state === "offline")
        {
            await startUp();
        }
        else if(device_state === "online")
        {
            await shutDown();
        }
    });
    power_button.style.cursor = "pointer";
    device_state = "offline";
}

async function startUp()
{
    device_state = "online";
    power_button.style.color = "#FFFFFF";
    if(screen)
    {
        screen.style.opacity = 1;
    }
    if(color_picker)
    {
        color_button.style.color = pad_color;
        color_picker.value = pad_color;
        color_picker.disabled = false;
    }
    pads.forEach((pad,index) =>
    {
        timeouts[index] = setTimeout(() => { pad.classList.add("active"); },100*(index + 1));
        setTimeout(() => { pad.classList.remove("active"); },100*(index + 1) + 150);
        if(!touch_device)
        {
            pad.classList.add("hover");
        }
    });
    addEventHandlers();
    await addMIDIListeners();
}

async function shutDown()
{
    device_state = "offline";
    power_button.style.color = "#000000";
    if(screen)
    {
        screen.style.opacity = 0;
        screen.style.cursor = "default";
    }
    if(color_picker)
    {
        let transition = getComputedStyle(color_button).transition;
        color_button.style.transition = transition.includes(", color 0.25s linear") ? transition : transition + ", color 0.25s linear";
        color_button.style.color = "#000000";
        color_picker.value = "#000000";
        color_picker.disabled = true;
    }
    pads.forEach((pad,index) =>
    {
        stopAudioSample(index);
        pad.classList.remove("active");
        pad.classList.remove("hover");
        clearTimeout(timeouts[index]);
    });
    removeEventHandlers();
    await removeMIDIListeners();
}

export {pads,screen,device_state,setupDevice};