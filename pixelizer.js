var Pixelizer = function(imgpath, position){

    this.imgpath = imgpath;
    this.position = position;
    this.init();

}

Pixelizer.prototype = {

    img :           null,
    canvas :        null,
    context :       null,
    refcanvas :     null,
    refcontext :    null,
    style :         '',
    pxIndex :       0,
    imageData :     null,
    grain :         16,
    padding :       0,

    init : function(containerId){
        if(!this.imgpath)
            return;
        var re = /([^\/]*)\/?([^\/]+)\.(jpg|gif|png)/gi;
        this.name = re.exec(this.imgpath)[2];
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', this.name);
        this.context = this.canvas.getContext('2d');
        this.refcanvas = document.createElement('canvas');
        this.refcontext = this.refcanvas.getContext('2d');
        var container = document.body;
        if(containerId)
            container = document.getElementById(containerId);
        container.appendChild(this.canvas);
        this.img = new Image();
        this.img.src = this.imgpath;
        var that = this;
        this.img.addEventListener('load', function(){that.draw()}, true);
        window.addEventListener('mousemove', that.setdistort.bind(this), true);
    },

    draw : function(){
        this.refcanvas.setAttribute('width', this.img.width);
        this.refcanvas.setAttribute('height', this.img.height);
        this.refcontext.drawImage(this.img, 0, 0, this.img.width, this.img.height);

        this.canvas.setAttribute('style', 'display:block; width:'+this.img.width+'px');
        this.canvas.setAttribute('width', this.img.width);
        this.canvas.setAttribute('height', this.img.height);

        if(this.grain==1 && this.padding==0){
            this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
            return;
        }

        var iData = this.refcontext.getImageData(0, 0, this.img.width, this.img.height);
        this.imageData = iData.data;

        this.numrows = Math.ceil(this.img.height/this.grain);
        this.numcols = Math.ceil(this.img.width/this.grain);
        this.pxIndex = 0;
        for(y=0;y<=this.numrows;y++){
            this.drawrow(y);
        }
    },

    drawrow : function(numrow){
        this.pxIndex = numrow*this.img.width*(this.grain+this.padding);
        for(var x=0;x<this.img.width;x+=(this.grain+this.padding)){
            this.drawswatch(x,numrow*(this.grain+this.padding));
            this.pxIndex+=this.grain+this.padding;
        }
    },

    drawswatch : function(x,y){
        red = this.imageData[this.pxIndex*4];
        green = this.imageData[this.pxIndex*4+1];
        blue = this.imageData[this.pxIndex*4+2];
        alpha = this.imageData[this.pxIndex*4+3];
        style = "rgba("+red+","+green+","+blue+","+(alpha/255)+")";
        this.context.fillStyle = style;
        rectsize = this.grain;
        if(rectsize < 1)
            rectsize = 1;
        this.context.fillRect( x, y, rectsize, rectsize);
    },

    setdistort : function(e){
        mouseX = event.clientX;
        mouseY = event.clientY;
        winH = window.innerHeight;
        winW = window.innerWidth;
        grainmodify = mouseX/winW;
        paddingmodify = mouseY/winH;
        if(this.position[0]=='bottom')
            paddingmodify = 1-paddingmodify;
        if(this.position[1]=='right')
            grainmodify = 1-grainmodify;
        newgrain = Math.floor(grainmodify*16)+1;
        newpadding = Math.floor(paddingmodify*4);
        if(newgrain != this.grain || newpadding != this.padding){
            this.grain = newgrain;
            this.padding = newpadding;
            this.draw();
        }
    }

};