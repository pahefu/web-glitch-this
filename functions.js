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
        this.sourceImage = document.getElementById('image');

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

        this.videoInput = document.getElementById("customVideo");
        this.videoInput.addEventListener('change', function (e) {
            for (const file of Array.from(this.files)) {   
                window.ImageParser.video.src = URL.createObjectURL(file);
                window.ImageParser.adjustCanvasSize(video.clientWidth, video.clientHeight);
                break;
            };
        }, false);

        this.imageInput = document.getElementById("customImage");
        this.imageInput.addEventListener('change', function (e) {
            for (const file of Array.from(this.files)) {                 
                window.ImageParser.loadImageByUrl(URL.createObjectURL(file));
                break;
            };
        }, false);

        this.manualGlitchButton = document.getElementById("reapplyGlitchBtn");
        this.manualGlitchButton.addEventListener('click', function() {
            window.ImageParser.processImageFrame();
        });

        this.downloadBtn = document.getElementById("downloadBtn");
        this.downloadBtn.addEventListener('click', function() {
            window.ImageParser.downloadGlitchedImage();
        });

        this.selectors = document.getElementsByClassName("sourceSelector");
        for(var s of this.selectors){
            s.addEventListener('click', function(e){
                var imgP = window.ImageParser;
                var rel = e.target.getAttribute("rel");
                for(var s of imgP.selectors){
                    s.className = "sourceSelector";
                    let localRel = s.getAttribute("rel");
                    if(rel == localRel){
                        s.className+=" active";
                    }                   
                    document.getElementById(localRel).className = "hidden";
                }
                document.getElementById(rel).className = "";
                

            });
        }
        

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

    loadImageByUrl(url){
        var imgP = window.ImageParser;
        imgP.sourceImage.onload = function(ev){          
            // Set the canvas values to match the image source dimensions           
            imgP.processImageFrame();
        }
        imgP.sourceImage.src = url;
    }

    processImageFrame(){
        var imgP = window.ImageParser;

        var w = imgP.sourceImage.naturalWidth;
        var h = imgP.sourceImage.naturalHeight;

        imgP.adjustCanvasSize(w,h);

        imgP.ctx_a.drawImage(imgP.sourceImage,0,0);
        imgP.ctx_b.drawImage(imgP.sourceImage,0,0);
        imgP.image_data.width = w;
        imgP.image_data.height = h;
        imgP.image_data.input = imgP.ctx_a.getImageData(0,0, w,h);
        imgP.image_data.output = imgP.ctx_b.getImageData(0,0, w,h);

        // do the glitch processing
        imgP.glitcher.glitch_image(imgP.image_data, imgP.glitchAmount, imgP.glitchColors, imgP.glitchScanlines, false, 0);
        imgP.ctx_b.putImageData(imgP.image_data.output, 0, 0);
    }

    downloadGlitchedImage(){
        var imgP = window.ImageParser;
        let image = imgP.canvasB.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
        var link = document.createElement('a');
        link.download = "web_glitched.png";
        link.href = image;
        link.click();
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