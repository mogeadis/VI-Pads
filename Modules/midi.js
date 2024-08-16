/**************************************************************************************************
Filename: midi.js

Description: This module sets up the MIDI functionality of the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {midi_notes} from "./config.js";
import {pads,screen,device_state} from "./device.js";
import {playAudioSample} from "./audio.js";

let midi_access = null;
let midi_device = null;
let midi_inputs = [];
let input_id = 0;
let pressed_midi = {};
let timeouts = {};

function setupMIDI()
{
    if(navigator.requestMIDIAccess)
    {
        navigator.requestMIDIAccess().then(onMIDISuccess).catch(onMIDIFailure);
    }
    else
    {
        console.error("Could not access the Web MIDI API.");
        alert("Could not access the Web MIDI API.");
    }
}

function onMIDISuccess(access)
{
    midi_access = access;
    midi_inputs = Array.from(midi_access.inputs.values());
    midi_device = midi_inputs.length > 0 ? midi_inputs[input_id] : null;
    midi_access.onstatechange = async (event) =>
    {
        const port = event.port;
        if(port.type === "input")
        {
            if(port.state === "connected" && !midi_inputs.includes(port))
            {
                console.log(`${port.name} has been connected.`);
                midi_inputs.push(port);
                input_id = midi_inputs.length - 2;
                await changeMIDIDevice();
            }
            else if(port.state === "disconnected" && midi_inputs.includes(port))
            {
                console.log(`${port.name} has been disconnected.`);
                midi_inputs = midi_inputs.filter(device => device.id !== port.id);
                if(!midi_inputs.includes(midi_device))
                {
                    input_id = midi_inputs.length - 2;
                    await changeMIDIDevice();
                }
            }
        }
    }
}

function onMIDIFailure()
{
    console.error("Could not access your MIDI devices.");
    alert("Could not access your MIDI devices.");
}

async function changeMIDIDevice()
{
    input_id += 1;
    input_id = input_id < midi_inputs.length ? input_id % midi_inputs.length : -1;
    if(input_id !== -1)
    {
        await removeMIDIListeners();
        midi_device = midi_inputs[input_id];
        await addMIDIListeners();
    }
    else
    {
        await removeMIDIListeners();
        midi_device = null;
        if(screen)
        {
            screen.innerText = "NO MIDI DEVICE";
        }
    }
}

async function addMIDIListeners()
{
    if(device_state === "online")
    {
        midi_notes.forEach((note) =>
        {
            pressed_midi[note] = false;
        });
        if(midi_device)
        {
            await midi_device.open();
            midi_device.onmidimessage = getMIDINote;
            console.log(`${midi_device.name} port has been opened.`);
        }
        if(screen)
        {
            screen.style.cursor = midi_inputs.length > 0 ? "pointer" : "default";
            screen.innerText = midi_device ? midi_device.name.toUpperCase() : "NO MIDI DEVICE";
        }
    }
}

async function removeMIDIListeners()
{
    if(midi_device)
    {
        midi_device.onmidimessage = null;
        await midi_device.close();
        console.log(`${midi_device.name} port has been closed.`);
    }
}

function getMIDINote(midi_message)
{
    const note = midi_message.data[1];
    if(midi_notes.includes(note))
    {
        const index = midi_notes.indexOf(note);
        const pad = pads[index];
        if((midi_message.data[0] === 144 && midi_message.data[2] !== 0))
        {
            if(!pressed_midi[note])
            {
                playAudioSample(index);
                if(timeouts[index])
                {
                    clearTimeout(timeouts[index]);
                    timeouts[index] = null;
                }
                pad.classList.add("active");
                pressed_midi[note] = true;
            }
        }
        else if((midi_message.data[0] === 144 && midi_message.data[2] === 0) || midi_message.data[0] === 128)
        {
            if(pressed_midi[note])
            {
                timeouts[index] = setTimeout(() => { pad.classList.remove("active"); },50);
                pressed_midi[note] = false;
            }
        }
    }
}

export {setupMIDI,changeMIDIDevice,addMIDIListeners,removeMIDIListeners};