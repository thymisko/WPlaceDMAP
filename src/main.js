// ==UserScript==
// @name         WPlace Dark Map
// @namespace    http://tampermonkey.net/
// @version      0.1-BETA
// @description  WPlace Dark Map plugin
// @author       miskaa
// @match        https://wplace.live/*
// @grant        none
// ==/UserScript==

// created for the boykisser art in Poland, Bieszczady, Ustajnowa

// saves your eyes

(function() {
    'use strict';

    // create ui

    // ======================
    // IMPORTANT: UI WAS MADE WITH **AI**
    // I DID NOT CREATE THE UI!
    // sorry mate im just lazy
    // -----------------------
    // CLAUDE DID ALSO IMPROVE A LITTLE BIT OF THIS CODE
    // ai slop type shit
    // ======================

    const ui = document.createElement('div');
    ui.id = 'darkMapUI';
    ui.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 250px;
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        color: #fff;
        padding: 12px;
        z-index: 9999;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        user-select: none;
        cursor: move;
    `;

    ui.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
            <span style="font-weight: bold;">WPlace DMap</span>
            <button id="darkMapToggle" style="background:#555;color:#fff;border:none;padding:4px 8px;cursor:pointer;border-radius:4px;font-size:10px;">─</button>
        </div>
        <div id="darkMapControls">
            <label style="display:block;margin-bottom:8px;">
                Map Darkness: <span id="darkMapBrightnessVal" style="color:#4CAF50;font-weight:bold;">70%</span>
            </label>
            <input type="range" id="darkMapBrightness" min="0.1" max="1" step="0.01" value="0.8"
                   style="width:100%; height:20px; background:#333; border-radius:10px;">
            <div style="margin-top: 8px; font-size: 10px; color: #aaa;">
                <label>
                    <input type="checkbox" id="preserveColors" checked style="margin-right: 4px;">
                    Preserve pixel colors (doesnt work yet)
                </label>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #888;">
                Status: <span id="statusText">Active</span>
            </div>
        </div>
    `;

    document.body.appendChild(ui);
    (function makeDraggable(element){
        let isDown = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', function(e){
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            isDown = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e){
            if(!isDown) return;
            element.style.left = Math.max(0, e.clientX - offsetX) + 'px';
            element.style.top = Math.max(0, e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', function(){
            isDown = false;
            element.style.cursor = 'move';
        });
    })(ui);

    const toggleBtn = document.getElementById('darkMapToggle');
    const controls = document.getElementById('darkMapControls');
    toggleBtn.addEventListener('click', () => {
        if(controls.style.display === 'none'){
            controls.style.display = 'block';
            toggleBtn.textContent = '─';
        } else {
            controls.style.display = 'none';
            toggleBtn.textContent = '+';
        }
    });

    const brightnessSlider = document.getElementById('darkMapBrightness');
    const brightnessVal = document.getElementById('darkMapBrightnessVal');
    const preserveColors = document.getElementById('preserveColors');
    const statusText = document.getElementById('statusText');

    let mapElements = [];
    let overlayDiv = null;

    function findMapElements() {
        const elements = [];
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            if (canvas.width > 100 && canvas.height > 100) {
                elements.push(canvas);
            }
        });
        const mapContainers = document.querySelectorAll('[class*="map"], [id*="map"], [class*="canvas"], [class*="viewport"]');
        mapContainers.forEach(el => elements.push(el));

        return elements;
    }
    function createOverlay() {
        if (overlayDiv) return overlayDiv;
        overlayDiv = document.createElement('div');
        overlayDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            pointer-events: none;
            z-index: 1;
            mix-blend-mode: multiply;
        `;
        overlayDiv.id = 'wplace-dark-overlay';
        document.body.appendChild(overlayDiv);
        return overlayDiv;
    }

    function applyDarkEffect() {
        const brightness = parseFloat(brightnessSlider.value);
        const darknessPercent = Math.round((1 - brightness) * 100);
        brightnessVal.textContent = `${darknessPercent}%`;
        mapElements = findMapElements();
        let appliedToElements = false;

        if (mapElements.length > 0) {
            mapElements.forEach(element => {
                if (preserveColors.checked) {
                    element.style.filter = '';
                } else {
                    element.style.filter = `brightness(${brightness})`;
                }
            });
            appliedToElements = true;
        }
        if (preserveColors.checked || !appliedToElements) {
            const overlay = createOverlay();
            overlay.style.background = `rgba(0, 0, 0, ${1 - brightness})`;
            statusText.textContent = 'Active (Overlay)';
            statusText.style.color = '#4CAF50';
        } else {
            if (overlayDiv) {
                overlayDiv.remove();
                overlayDiv = null;
            }
            statusText.textContent = `Active (${mapElements.length} elements)`;
            statusText.style.color = '#4CAF50';
        }
    }
    // thanks claude <3
    brightnessSlider.addEventListener('input', applyDarkEffect);
    preserveColors.addEventListener('change', applyDarkEffect);

    function continuousMonitor() {
        try {
            applyDarkEffect();
        } catch (error) {
            console.warn('WPlace DarkMap error:', error);
            statusText.textContent = 'Error';
            statusText.style.color = '#ff6b6b';
        }
        requestAnimationFrame(continuousMonitor);
    }

    setTimeout(() => {
        continuousMonitor();
        console.log('WPlace Dark Map loaded successfully');
    }, 1000);

    window.addEventListener('beforeunload', () => {
        if (overlayDiv) overlayDiv.remove();
    });

})();
