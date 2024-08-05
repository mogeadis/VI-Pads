/**************************************************************************************************
Filename: audio.js

Description: This module sets up the audio functionality of the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {format,directory,sounds} from "./config.js";

let audio_context = null;
let audio_buffers = [];
let audio_sources = [];
let active_sources = [];

function setupAudio()
{
    if(window.AudioContext)
    {
        audio_context = new window.AudioContext({ latencyHint: 0 });
        controlAudioContext();
        loadAudioSamples();
    }
    else
    {
        console.error("Could not access the Web Audio API.");
        alert("Could not access the Web Audio API.");
    }
}

function controlAudioContext()
{
    const body = document.body;
    if(audio_context.state === "suspended")
    {
        body.addEventListener("click",unlock,false);
    }
    function unlock()
    {
        audio_context.resume().then(clear);
    }
    function clear()
    {
        body.removeEventListener("click",unlock);
    }
    document.addEventListener("visibilitychange",() =>
    {
        if(document.hidden)
        {
            for(let index = 0; index < sounds.length; index++)
            {
                stopAudioSample(index);
            }
            setTimeout(() => { audio_context.suspend(); },50);
        }
        if(!document.hidden)
        {
            setTimeout(() => { audio_context.resume(); },50);
        }
    },false);
}

function loadAudioSamples()
{
    sounds.forEach(async (sound,index) =>
    {
        const filepath = directory + sound + format;
        try
        {
            const response = await fetch(filepath);
            if(response.ok)
            {
                audio_context.decodeAudioData(await response.arrayBuffer(),
                (buffer) =>
                {
                    audio_buffers[index] = buffer;
                    active_sources[index] = false;
                },
                (error) =>
                {
                    console.error("Error decoding audio data from " + filepath,error);
                    alert("Error decoding audio data from " + filepath + "\n" + error);
                });
            }
            else
            {
                throw new Error();
            }
        }
        catch
        {
            console.error("Error loading audio file " + filepath);
            alert("Error loading audio file " + filepath);
        }
    });
}

function playAudioSample(index)
{
    if(sounds[index] === "closed_hi-hat" || sounds[index] === "pedal_hi-hat")
    {
        stopAudioSample(sounds.indexOf("open_hi-hat"));
    }
    stopAudioSample(index);
    const source = audio_context.createBufferSource();
    source.buffer = audio_buffers[index];
    source.onended = () => { active_sources[index] = false; };
    source.connect(audio_context.destination);
    source.start();
    audio_sources[index] = source;
    active_sources[index] = true;
}

function stopAudioSample(index)
{
    if(active_sources[index])
    {
        audio_sources[index].onended = null;
        audio_sources[index].stop();
        audio_sources[index].disconnect();
        active_sources[index] = false;
    }
}

export {setupAudio,playAudioSample,stopAudioSample};