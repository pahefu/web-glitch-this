/*
@Pahefu 2020-02

Code to call a image parsing, creating a glitched version
Also, per-frame glitching on video

*/

class ImageParser{

    constructor(){

        window.ImageParser = this;

        this.canvasA = document.createElement("canvas");
        this.canvasB = document.getElementById("canvasB");
        this.ctx_a = this.canvasA.getContext("2d");
        this.ctx_b = this.canvasB.getContext("2d");
        
        this.video = document.getElementById('video');
        
        // Glitch properties
        this.glitcher = new ImageGlitcher();
        this.glitchScanlines = true;
        this.glitchColors = true;
        this.glitchAmount = 2;
        
        this.image_data = {
            input : null, output:null,
            width : 0, height: 0
        };

        // Settings
        this.domGlitchAmount = document.getElementById("glitchAmount");
        this.domGlitchColors = document.getElementById("glitchColors");
        this.domGlitchScanLines = document.getElementById("scanLines");

        this.domGlitchAmount.addEventListener('change', window.ImageParser.syncSettings);
        this.domGlitchAmount.addEventListener('update', window.ImageParser.syncSettings);
        this.domGlitchColors.addEventListener('change', window.ImageParser.syncSettings);
        this.domGlitchScanLines.addEventListener('change', window.ImageParser.syncSettings);

        this.filesInput = document.getElementById("customFile");
        this.filesInput.addEventListener('change', function (e) {
    
            // go through all selected files
            for (const file of Array.from(this.files)) {   
                video.src = URL.createObjectURL(file);

                window.ImageParser.adjustCanvasSize(video.clientWidth, video.clientHeight);

                break;
            };
        }, false /* don't capture */);

    }

    syncSettings(e){
        var pThis = window.ImageParser;
        pThis.glitchAmount = pThis.domGlitchAmount.value;
        pThis.glitchColors = pThis.domGlitchColors.checked ;
        pThis.glitchScanlines = pThis.domGlitchScanLines.checked;
    }

    adjustCanvasSize(w,h){
        var pThis = window.ImageParser;
        pThis.canvasA.width = w;
        pThis.canvasA.height = h;
        pThis.canvasB.width = w;
        pThis.canvasB.height = h;
        
        pThis.ctx_b.fillStyle = "black";
        pThis.ctx_b.fillRect(0, 0, w,h);
    }

    loadImageByName(name){
        var domImage = document.createElement("img");
        var parent = this;
        
        domImage.onload = function(ev){          
            // Set the canvas values to match the image source dimensions

            window.ImageParser.adjustCanvasSize(this.width, this.height);

            parent.ctx_a.drawImage(this,0,0);
            parent.ctx_b.drawImage(this,0,0);

            parent.image_data.width = this.width;
            parent.image_data.height = this.height;
            parent.image_data.input = parent.ctx_a.getImageData(0,0, this.width,this.height);
            parent.image_data.output = parent.ctx_b.getImageData(0,0, this.width,this.height);

            // do the glitch processing
            parent.glitcher.glitch_image(parent.image_data, parent.glitchAmount, parent.glitchColors, parent.glitchScanlines, false, 0);
            parent.ctx_b.putImageData(parent.image_data.output, 0, 0);
        }
        domImage.src = name;
    }

    initVideoRendering(){
        window.ImageParser.adjustCanvasSize(this.video.width, this.video.height);
        this.video.addEventListener('play', function(){
            window.ImageParser.adjustCanvasSize(this.clientWidth, this.clientHeight);
            window.ImageParser.image_data.width = this.clientWidth;
            window.ImageParser.image_data.height = this.clientHeight;
            window.ImageParser.processVideoFrame();
        },false)
    }

    processVideoFrame(){
        let v = window.ImageParser.video;
        let c = window.ImageParser.ctx_a;
        
        let w = v.clientWidth;
        let h = v.clientHeight;

        if(v.paused || v.ended) {
            clearTimeout(window.PlayTimeout);
            return false;
        }
        c.drawImage(v,0,0,w,h);
        
        let imgP = window.ImageParser;

        imgP.image_data.input = imgP.ctx_a.getImageData(0,0, w,h);
        imgP.image_data.output =imgP.ctx_b.getImageData(0,0, w,h);
        imgP.glitcher.glitch_image( imgP.image_data, imgP.glitchAmount, imgP.glitchColors, imgP.glitchScanlines, false, 0);
        imgP.ctx_b.putImageData( imgP.image_data.output, 0, 0);

        window.PlayTimeout = setTimeout(window.ImageParser.processVideoFrame,20);
    
    }


}