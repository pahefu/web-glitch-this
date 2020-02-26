/*
@Pahefu 2020-02

Ported to Javascript canvas, code taken from:

@TotallyNotChase
https://github.com/TotallyNotChase/glitch-this

*/


// JS has no 'randint' function, so this is ... just a facade
function randint(min_int, max_int){
    var max_range = Math.abs(max_int - min_int);
    var res = Math.floor(Math.random() * max_range) + min_int; 
    return res;
}

class ImageGlitcher{

    constructor(){
        this.pixel_tuple_len = 4; // JS: pixel data is going to have that
        
        this.img_width = 0;
        this.img_height = 0;
        this.img_mode = 'Unknown'; // JS: Not going to be used in Javascript
        this.img_data_ptr = null;
        
        // JS: No arrays required in this version, will be set on img_data_ptr

    }

    glitch_image(img_rgb_data, glitch_amount, color_offset, scan_lines, gif, frames){

        color_offset = (color_offset || false);
        scan_lines = (scan_lines || false);
        gif = (gif || false);
        frames = 0; // No frames, unfortunately

        if(glitch_amount<1 || glitch_amount>10){
            console.log("glitch_amount parameter must be in range 1 to 10, inclusive");
            return;
        }

        // JS: Path doesnt exist in JS

        // JS: Canvas pixel data is always set as RGBA

        this.pixel_tuple_len = 4;
        this.img_data_ptr = img_rgb_data;
        this.img_width = img_rgb_data.width;
        this.img_height = img_rgb_data.height;
        
        //  As there is no gif support, just return the single image after glitching
        //  No gif code, unfortunately
        
        // JS: bypass the img_rgb_data to not reallocate new vars in the class
        this.get_glitched_img(glitch_amount, color_offset, scan_lines)   ;

    }

    get_glitched_img(glitch_amount, color_offset, scan_lines){
        let glitch_pow_2 = Math.pow(glitch_amount,2);
        let max_offset = Math.floor((glitch_pow_2 / 100) * this.img_width);

        for (var i = 0;i<glitch_amount*2;i++){
            let current_offset = randint(-max_offset, max_offset);

            if(current_offset == 0){
                // Can't wrap left OR right when offset is 0, End of Array
                continue;
            }

            if(current_offset < 0){
                // Grab a rectangle of specific width and heigh, shift it left
                // by a specified offset
                // Wrap around the lost pixel data from the right
                this.glitch_left(-current_offset);
            }else{
                // Grab a rectangle of specific width and height, shift it right
                // by a specified offset
                // Wrap around the lost pixel data from the left
                this.glitch_right(current_offset);
            }

        }

        if(color_offset){
            // Add color channel offset if checked true
            this.color_offset(randint(-glitch_amount * 2, glitch_amount * 2),  randint(-glitch_amount * 2, glitch_amount * 2), this.get_random_channel());
        }

        if(scan_lines){
            //  Add scan lines if checked true
            this.add_scan_lines();
        }
    }

    add_scan_lines(){
        
        // should zero-black every other row
        var px_offset = 0;
        var output = this.img_data_ptr.output.data;
        for(var row = 0;row<this.img_height;row++){
            if(row%2 == 0){
                px_offset = row*this.img_width*this.pixel_tuple_len;
                for(var col = 0;col <this.img_width; col++){
                    output[px_offset] = 0;
                    output[px_offset+1] = 0;
                    output[px_offset+2] = 0;
                    output[px_offset+3] = 0xff;
                    px_offset+=this.pixel_tuple_len;
                }
            }
        }
    }

    glitch_left(offset){

        // JS: Adapted version from Python code

        var output = this.img_data_ptr.output.data;
        var input = this.img_data_ptr.input.data;

        let start_y = randint(0, this.img_height);
        var chunk_height = randint(1, Math.floor(this.img_height / 4));
        chunk_height = Math.min(chunk_height, this.img_height - start_y);
        let stop_y = start_y + chunk_height;
        let start_x = offset;
        let stop_x = this.img_width - start_x;

        let steps = start_x;
        
        for(var row = start_y; row<stop_y;row++){
            var pixel_offset = (row*this.img_width*this.pixel_tuple_len);
            
            var entry_px = pixel_offset ;
            var output_px = pixel_offset + ((stop_x)*this.pixel_tuple_len);
            
            for(var i = 0;i< (stop_x-start_x);i++){
                entry_px = pixel_offset + ((start_x+i)*this.pixel_tuple_len);
                output[output_px] = input[entry_px];
                output[output_px+1] = input[entry_px+1];
                output[output_px+2] = input[entry_px+2];
                output[output_px+3] = input[entry_px+3];
                output_px+=this.pixel_tuple_len;
            }

            for(var i = 0;i<steps;i++){
                output[output_px] = input[entry_px];
                output[output_px+1] = input[entry_px+1];
                output[output_px+2] = input[entry_px+2];
                output[output_px+3] = input[entry_px+3];
                entry_px+=this.pixel_tuple_len;
                output_px+=this.pixel_tuple_len;
            }

        }

    }

    glitch_right(offset){

        // JS: Adapted version from Python code

        var output = this.img_data_ptr.output.data;
        var input = this.img_data_ptr.input.data;

        let start_y = randint(0, this.img_height);
        let chunk_height = randint(1, Math.floor(this.img_height / 4));
        chunk_height = Math.min(chunk_height, this.img_height - start_y);
        let stop_y = start_y + chunk_height

        let start_x = offset
        let stop_x = this.img_width - offset
        
        let steps = this.img_width - stop_x;

        for(var row = start_y; row<stop_y;row++){
            var pixel_offset = (row*this.img_width*this.pixel_tuple_len);

            var entry_px = pixel_offset + ((stop_x+1)*this.pixel_tuple_len);
            var output_px = pixel_offset + (start_x*this.pixel_tuple_len);

            for(var i = 0;i<steps;i++){
                output[output_px] = input[entry_px];
                output[output_px+1] = input[entry_px+1];
                output[output_px+2] = input[entry_px+2];
                output[output_px+3] = input[entry_px+3];
                entry_px+=this.pixel_tuple_len;
                output_px+=this.pixel_tuple_len;
            }

            for(var i = 0;i< (stop_x-start_x);i++){
                entry_px = pixel_offset + ((start_x+i)*this.pixel_tuple_len);
                output[output_px] = input[entry_px];
                output[output_px+1] = input[entry_px+1];
                output[output_px+2] = input[entry_px+2];
                output[output_px+3] = input[entry_px+3];
                output_px+=this.pixel_tuple_len;
            }
          
        }

    }

    color_offset(offset_x, offset_y, channel_index){

        // JS: Adapted version from Python code

        var output = this.img_data_ptr.output.data;
        var input = this.img_data_ptr.input.data;

        offset_x = (offset_x >= 0) ? offset_x : this.img_width + offset_x;
        offset_y = (offset_y >= 0) ? offset_y : this.img_height + offset_y;

        var output_px = (offset_y*this.img_width*this.pixel_tuple_len);
        var input_px = 0;

        for(var col = 0;col<this.img_width; col++){

            if(col>offset_x){
                input_px = (offset_x+col)*this.pixel_tuple_len;
            }else{
                input_px = (col-offset_x)*this.pixel_tuple_len;
            }
               
            output[output_px+channel_index] = input[input_px+channel_index];
            output_px+=this.pixel_tuple_len;
        }

        // First pass
        var inputRow = (this.img_height-offset_y);
        var linesToProcess = inputRow-1;

        input_px = 1*this.img_width*this.pixel_tuple_len;
        output_px = (offset_y+1)*this.img_width*this.pixel_tuple_len;

        for(var i = 0;i<linesToProcess;i++){
            for(var col = 0;col<this.img_width; col++){              
                output[output_px+channel_index] = input[input_px+channel_index];
                input_px+=this.pixel_tuple_len;
                output_px+=this.pixel_tuple_len;
            }
        }

        // Second pass
        inputRow = (this.img_height-offset_y);
        linesToProcess = this.img_height-inputRow;

        input_px = (inputRow)*this.img_width*this.pixel_tuple_len;
        output_px = 0; // first row, aka 0th row
        for(var i = 0;i<linesToProcess;i++){
            for(var col = 0;col<this.img_width; col++){              
                output[output_px+channel_index] = input[input_px+channel_index];
                input_px+=this.pixel_tuple_len;
                output_px+=this.pixel_tuple_len;
            }
        }

    }

    get_random_channel(){
        // Returns a random index from 0 to pixel_tuple_len
        // For an RGB image, a 0th index represents the RED channel
        return randint(0, this.pixel_tuple_len - 1);
    }

}