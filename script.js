/**************************************************************************************************
Filename: script.js

Description: This script sets up the interactivity of the web page that hosts the project

Author: Alexandros Iliadis
Project: VI-Pads
Date: August 2024
**************************************************************************************************/

import {setupDevice} from "./Modules/device.js";
import {setupAudio} from "./Modules/audio.js";
import {setupMIDI} from "./Modules/midi.js";

window.onload = main;

function main()
{
    setupDevice();
    setupAudio();
    setupMIDI();
}