Array.prototype.each = function(callback){
  var count = 0;
  for (var i = 0; i < this.length(); i++){
    var el = this[i];
    callback.call(this,el,count);
    count++;
  }
}

var alert = function(msg, title) {
  if (title == undefined) { title = "Whoops" };
  var app = NSApplication.sharedApplication();
  app.displayDialog(msg).withTitle(title);
},MUGlobal = {
  current: ( doc.currentPage().currentArtboard() )? doc.currentPage().currentArtboard(): doc.currentPage(),
  color: { r: 1, g: 0, b: 0 },
  font: {
    size: 12,
    family: 'Helvetica',
    color: { r: 1, g: 1, b: 1 }
  }
},Measure = {
  Guides: [],
  Attrs: [],
  setColor: function( el, r, g, b ){
    if( el.style().fills().length() <= 0 ){
      el.style().fills().addNewStylePart();
    }
    var color = el.style().fills()[0].color();

    color.setRed( r );
    color.setGreen( g );
    color.setBlue( b );
  },
  getPosition: function( layer ){
    var postion = { x: 0, y: 0 },
        getPostion = function( layer ){
          postion.x += layer.frame().x();
          postion.y += layer.frame().y();
          if(layer.parentGroup().class() == MSLayerGroup){
            getPostion(layer.parentGroup());
          }
        };
    getPostion( layer );
    return postion;
  },
  createGuide: function(){
    var guide = {},
        current = MUGlobal.current;

    guide.group = current.addLayerOfType('group');
    guide.group.name = '$Guide-' + ( new Date().getTime() );

    current = guide.group;

    guide.gap = current.addLayerOfType('rectangle');
    guide.gap.name = 'gap';
    guide.gap.frame().setWidth(8);
    guide.gap.frame().setHeight(8);
    guide.gap.setRotation(45);
    guide.gap.style().fills().addNewStylePart();
    this.setColor( guide.gap, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

    guide.line = current.addLayerOfType('rectangle');
    guide.line.name = 'line';
    this.setColor( guide.line, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

    guide.startArrow = current.addLayerOfType('rectangle');
    guide.startArrow.name = 'start-arrow';
    this.setColor( guide.startArrow, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

    guide.endArrow = current.addLayerOfType('rectangle');
    guide.endArrow.name = 'end-arrow';
    this.setColor( guide.endArrow, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

    guide.label = current.addLayerOfType('rectangle');
    guide.label.name = 'label';
    this.setColor( guide.label, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

    return guide;
  },
  addLabel: function( guide, length ){
    var current = guide.group;

    guide.text = current.addLayerOfType('text');
    guide.text.name = parseInt(length);
    guide.text.setStringValue( parseInt(length) + ' px');
    guide.text.setFontSize( MUGlobal.font.size );
    guide.text.setFontPostscriptName( MUGlobal.font.family );
    this.setColor( guide.text, MUGlobal.font.color.r, MUGlobal.font.color.g, MUGlobal.font.color.b );

    guide.text.frame().setX(5);
    guide.text.frame().setY(5);

    guide.label.frame().setWidth( guide.text.frame().width() + 10 );
    guide.label.frame().setHeight( MUGlobal.font.size + 11 );
    return guide;
  },
  setAttrs: function( guide, attrs ){
    var self = this,
        label = attrs.label,
        line = attrs.line,
        arrow = attrs.arrow,
        gap = attrs.gap,
        current = MUGlobal.current;

    guide.label.frame().setWidth( label.width );
    guide.label.frame().setHeight( label.height );

    if( current.class() == MSArtboardGroup && label.x < 0 ){
      label.x = 0;
    }
    else if( current.class() == MSArtboardGroup && current.frame().width() < ( label.x + label.width ) ){
      label.x = label.x - ( label.x + label.width - current.frame().width() );
    }

    guide.label.frame().setX( label.x );
    guide.label.frame().setY( label.y );
    guide.text.frame().addX( label.x );
    guide.text.frame().addY( label.y );

    guide.line.frame().setWidth( line.width );
    guide.line.frame().setHeight( line.height );
    guide.line.frame().setX( line.x );
    guide.line.frame().setY( line.y );

    guide.startArrow.frame().setWidth( arrow.width );
    guide.startArrow.frame().setHeight( arrow.height );
    guide.startArrow.frame().setX( arrow.start.x );
    guide.startArrow.frame().setY( arrow.start.y );

    guide.endArrow.frame().setWidth( arrow.width );
    guide.endArrow.frame().setHeight( arrow.height );
    guide.endArrow.frame().setX( arrow.end.x );
    guide.endArrow.frame().setY( arrow.end.y );

    guide.gap.frame().setX( gap.x );
    guide.gap.frame().setY( gap.y );

    guide.text.setIsSelected( 1 );
    guide.text.setIsSelected( 0 );
    guide.group.setIsSelected( 1 );
  },
  width: function( position, layer ){
    var self = this,
        layers = selection,
        fn = function( layer ){
          var width = layer.frame().width(),
              height = layer.frame().height(),
              layerPostion = self.getPosition(layer),
              x = layerPostion.x,
              y = layerPostion.y,
              label = {},
              text = {},
              line = {},
              arrow = {},
              gap = {},
              guide = self.createGuide();

          arrow.start = {};
          arrow.end = {};

          guide = self.addLabel( guide, width );

          arrow.width = 1;
          arrow.height = 7;
          label.width = guide.label.frame().width();
          label.height = guide.label.frame().height();
          label.x = parseInt( x + ( width - label.width ) / 2 );
          label.y = parseInt( y - ( label.height + arrow.height ) / 2 - 1 );

          if( position && position == 'middle' ){
            label.y = parseInt( y - ( label.height - height ) / 2 );
          }
          else if( position && position == 'bottom' ){
            label.y = parseInt( y + height - label.height + ( label.height + arrow.height ) / 2 + 1 );
          }

          line.width = width;
          line.height = 1;
          line.x = x;
          line.y = parseInt( label.y + label.height / 2 );

          arrow.start.x = x;
          arrow.start.y = parseInt( label.y + ( label.height - arrow.height ) / 2 );
          arrow.end.x = arrow.start.x + width - 1;
          arrow.end.y = arrow.start.y;

          gap.x = label.x + 10;
          gap.y = label.y + 10;

          if( ( label.width + 20 ) > width ){
            gap.x = parseInt( x + ( width - 8 ) / 2 );
            if( position && position == 'bottom' ){
              label.y = parseInt( label.y + label.height - 8 / 2 );
              gap.y = parseInt( label.y - 4 );
            }
            else{
              label.y = parseInt( label.y - label.height + 8 / 2 );
              gap.y = parseInt( label.y + label.height - 6 );
            }
          }

          self.setAttrs( guide, {
            label: label,
            line: line,
            arrow: arrow,
            gap: gap
          });
          layer.setIsSelected( 0 );
        }

    if ( layer ){
      fn.call( this, layer );
    }
    else if (layers.length() > 0) {
      layers.each(fn);
    }
    else{
      alert("Make sure you've selected a symbol, or a layer that.");
    }
  },
  height: function( position, layer ){
    var self = this,
        layers = selection,
        fn = function( layer ){
          var width = layer.frame().width(),
              height = layer.frame().height(),
              layerPostion = self.getPosition(layer),
              x = layerPostion.x,
              y = layerPostion.y,
              label = {},
              text = {},
              line = {},
              arrow = {},
              gap = {},
              guide = self.createGuide();

          arrow.start = {};
          arrow.end = {};

          guide = self.addLabel( guide, height );

          arrow.width = 7;
          arrow.height = 1;
          label.width = guide.label.frame().width();
          label.height = guide.label.frame().height();
          label.x = parseInt( x - ( label.width + arrow.width ) / 2 - 1 );
          label.y = parseInt( y + ( height - label.height) / 2 );

          if( position && position == 'center' ){
            label.x = parseInt( x + ( width - label.width ) / 2 );
          }
          else if( position && position == 'right' ){
            label.x = parseInt( x + width - label.width + ( label.width + arrow.width ) / 2 + 1 );
          }

          line.width = 1;
          line.height = height;
          line.x = parseInt( label.x + label.width / 2 );
          line.y = y;

          arrow.start.x = parseInt( line.x - arrow.width / 2 + 1 );
          arrow.start.y = y;
          arrow.end.x = arrow.start.x;
          arrow.end.y = parseInt( y + height - 1 );

          gap.x = label.x + 10;
          gap.y = label.y + 10;

          if( ( label.height + 20 ) > height ){
            gap.y = parseInt( y + ( height - 8 ) / 2 );
            if( position && position == 'right' ){
              label.x = parseInt( line.x + arrow.width );
              gap.x = parseInt( label.x - 4 );
            }
            else{
              label.x = line.x - label.width - arrow.width;
              gap.x = parseInt( label.x + label.width - 4 );
            }
          }

          self.setAttrs(guide, {
            label: label,
            line: line,
            arrow: arrow,
            gap: gap
          });
          layer.setIsSelected( 0 );
        };
    if ( layer ){
      fn.call( this, layer );
    }
    else if (layers.length() > 0) {
      layers.each(fn);
    }
    else{
      alert("Make sure you've selected a symbol, or a layer that.");
    }
  },
  font: function( position ){
    var self = this,
        current = MUGlobal.current;

    if (selection.length() > 0) {
      selection.each(function( layer ){
        var height = layer.frame().height(),
            layerPostion = self.getPosition(layer),
            x = layerPostion.x,
            y = layerPostion.y,
            guide = {};

        if( layer.class() == MSTextLayer ){

          guide.group = current.addLayerOfType('group');
          guide.group.name = '$Guide-' + ( new Date().getTime() );
          guide.gap = guide.group.addLayerOfType('rectangle');
          guide.label = guide.group.addLayerOfType('rectangle');
          guide.text = guide.group.addLayerOfType('text');

          guide.gap.name = 'gap';
          guide.gap.frame().setWidth(8);
          guide.gap.frame().setHeight(8);
          guide.gap.setRotation(45);
          guide.gap.style().fills().addNewStylePart();
          self.setColor( guide.gap, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

          var font = layer.fontPostscriptName(),
              size = parseInt(layer.fontSize()) + ' px',
              fills = layer.style().fills(),
              color = ( fills.length() > 0 )? fills[0].color(): layer.textColor(),
              hex = ( color.hexValue().toString() == '0' )? '000000': color.hexValue().toString(),
              red = parseInt(color.red() * 255),
              green = parseInt(color.green() * 255),
              blue = parseInt(color.blue() * 255),
              colorText = '#' + hex + ' (rgb:' + red + ',' + green + ',' + blue + ')';

          guide.text.name = parseInt( layer.fontSize() );
          guide.text.setStringValue( 'Font: ' + font + '\r\n' + 'Size: ' + size + '\r\n' + 'Color: ' + colorText );
          guide.text.setFontSize( MUGlobal.font.size );
          guide.text.setFontPostscriptName( MUGlobal.font.family );
          guide.text.style().fills().addNewStylePart();
          self.setColor( guide.text, MUGlobal.font.color.r, MUGlobal.font.color.g, MUGlobal.font.color.b );
          guide.text.frame().setX( 5 );
          guide.text.frame().setY( 8 );

          guide.label.frame().setWidth( guide.text.frame().width() + 10 );
          guide.label.frame().setHeight( guide.text.frame().height() + 10 );
          guide.label.style().fills().addNewStylePart();
          self.setColor( guide.label, MUGlobal.color.r, MUGlobal.color.g, MUGlobal.color.b );

          var attrs = {};
          attrs.label = {};
          attrs.gap = {};

          attrs.label.width = guide.label.frame().width();
          attrs.label.height = guide.label.frame().height();

          attrs.label.x = x;
          attrs.label.y = parseInt( y - attrs.label.height );
          attrs.gap.x = attrs.label.x + 9;
          attrs.gap.y = attrs.label.y + attrs.label.height - 4;

          if( position && position == 'bottom' ){
            attrs.label.y = parseInt( y + height );
            attrs.gap.y = attrs.label.y - 4;
          }

          if( current.class() == MSArtboardGroup && attrs.label.x < 0 ){
            attrs.label.x = 0;
          }
          else if( current.class() == MSArtboardGroup && current.frame().width() < ( attrs.label.x + attrs.label.width ) ){
            attrs.label.x = attrs.label.x - ( attrs.label.x + attrs.label.width - current.frame().width() );
          }

          guide.label.frame().setX( attrs.label.x );
          guide.label.frame().setY( attrs.label.y );
          guide.text.frame().addX( attrs.label.x );
          guide.text.frame().addY( attrs.label.y );
          guide.gap.frame().setX( attrs.gap.x );
          guide.gap.frame().setY( attrs.gap.y );

          layer.setIsSelected( 0 );
          guide.text.setIsSelected( 1 );
          guide.text.setIsSelected( 0 );
          guide.group.setIsSelected( 1 );

        }
      });



    }
    else{
      alert("Make sure you've selected a symbol, or a layer that.");
    }
  },
  spacing: function( position, isDistance ){
    var self = this,
        current = MUGlobal.current,
        layers = selection,
        tTemp = {},
        lTemp = {},
        iTemp = {},
        distance = {},
        layer,
        target;

    if( layers.length() == 1 && current.class() == MSArtboardGroup ){
      layer = current;
      target = layers[0];
    }
    else if( layers.length() == 2 ){
      layer = layers[0];
      target = layers[1];
    }
    else{
      return false;
    }

    var tPosition = self.getPosition(target),
        lPosition = self.getPosition(layer);

    tTemp.width = target.frame().width();
    tTemp.height = target.frame().height();
    tTemp.x = tPosition.x;
    tTemp.y = tPosition.y;

    lTemp.width = layer.frame().width();
    lTemp.height = layer.frame().height();
    lTemp.x = lPosition.x;
    lTemp.y = lPosition.y;

    if( layer.class() == MSArtboardGroup ){
      lTemp.x = 0;
      lTemp.y = 0;
    }

    distance.top = tTemp.y - lTemp.y;
    distance.right = ( lTemp.x + lTemp.width ) - ( tTemp.x + tTemp.width );
    distance.bottom = ( lTemp.y + lTemp.height ) - ( tTemp.y + tTemp.height );
    distance.left = tTemp.x - lTemp.x;

    if( position && position == 'top' ){
      iTemp.x = tTemp.x;
      iTemp.y = lTemp.y;
      iTemp.width = tTemp.width;
      iTemp.height = distance.top;
      if( isDistance && iTemp.height > lTemp.height ){
        iTemp.y = lTemp.y + lTemp.height;
        iTemp.height = iTemp.height - lTemp.height;
      }

    }
    else if( position && position == 'right' ){
      iTemp.x = tTemp.x + tTemp.width;
      iTemp.y = tTemp.y;
      iTemp.width = distance.right;
      iTemp.height = tTemp.height;
      if( isDistance && iTemp.width > lTemp.width ){
        iTemp.width = iTemp.width - lTemp.width;
      }
    }
    else if( position && position == 'bottom' ){
      iTemp.x = tTemp.x;
      iTemp.y = tTemp.y + tTemp.height;
      iTemp.width = tTemp.width;
      iTemp.height = distance.bottom;
      if( isDistance && iTemp.height > lTemp.height ){
        iTemp.height = iTemp.height - lTemp.height;
      }
    }
    else if( position && position == 'left' ){
      iTemp.x = lTemp.x;
      iTemp.y = tTemp.y;
      iTemp.width = distance.left;
      iTemp.height = tTemp.height;

      if( isDistance && iTemp.width > lTemp.width ){
        iTemp.x = lTemp.x + lTemp.width;
        iTemp.width = iTemp.width - lTemp.width;
      }
    }

    iTemp.x = ( iTemp.width < 0 )? iTemp.x + iTemp.width: iTemp.x;
    iTemp.y = ( iTemp.height < 0 )? iTemp.y + iTemp.height: iTemp.y;
    iTemp.width = ( iTemp.width < 0 )? 1 - iTemp.width: iTemp.width;
    iTemp.height = ( iTemp.height < 0 )? 1 - iTemp.height: iTemp.height;

    if( iTemp.width == 0 || iTemp.height == 0 ){
      return false;
    }

    var temp = current.addLayerOfType('rectangle');
        temp.frame().setX( iTemp.x );
        temp.frame().setY( iTemp.y );
        temp.frame().setWidth( iTemp.width );
        temp.frame().setHeight( iTemp.height );

      if( position && ( position == 'top' || position == 'bottom' ) ){
        self.height( 'center', temp );
      }
      else if( position && ( position == 'left' || position == 'right' ) ){
        self.width( 'middle', temp );
      }

      current.removeLayer( temp );
      layer.setIsSelected( 0 );
      target.setIsSelected( 0 );

  },
  distance: function( type ){
    var self = this,
        layers = selection;

    if( layers.length() > 0 && layers.length() < 3 ){
      var layer = layers[0],
          target = layers[1];

      if( type && type == 'width' ){
        if( target.frame().x() > layer.frame().x() + layer.frame().width() ){
          self.spacing( 'left', true );
        }
        else if( target.frame().x() < layer.frame().x() + layer.frame().width() ){
          self.spacing( 'right', true );
        }
      }
      else if( type && type == 'height' ){
        if( target.frame().y() > layer.frame().y() + layer.frame().height() ){
          self.spacing( 'top', true );
        }
        else if( target.frame().y() < layer.frame().y() + layer.frame().height() ){
          self.spacing( 'bottom', true );
        }
      }
    }
    else{
      alert("Make sure you've selected two symbols, or two layers that.");
    }
  },
  color: function( type ){
    var self = this,
        type = type,
        current = MUGlobal.current,
        resetColor = function( layers ){
          var layers = layers;
          layers.each(function( layer ){
            if( layer.class() == MSLayerGroup && layer.name().match(/\$Guide\-\d+/) ){
              var guideItems = layer.layers();

              guideItems.each(function( item ){

                if( type == 'shape' && item.class() == MSShapeGroup ){
                  self.setColor(item, color.r, color.g, color.b);
                }
                else if( type == 'text' && item.class() == MSTextLayer ){
                  self.setColor(item, color.r, color.g, color.b);
                }
              });
            }
            else if( layer.class() == MSLayerGroup ){
              resetColor( layer.layers() );
            }

          });
        },
        inputLabel, inputValue;

        if( type == 'text' ){
          inputLabel = 'Do you want to reset all text color (HEX: #FFFFFF)',
          inputValue = '#FFFFFF';
        }
        else if( type == 'shape' ){
          inputLabel = 'Do you want to reset all background color (HEX: #FF0000)',
          inputValue = '#4A90E2';
        }

        var colorHex = [doc askForUserInput:inputLabel initialValue:inputValue],
            color = {};

        if( colorHex.match(/^\#([a-f\d]{2}){3}$/i) ){
          colorRGB16 = colorHex.match(/[a-f\d]{2}/ig);

          color.r = parseInt(colorRGB16[0], 16) / 255;
          color.g = parseInt(colorRGB16[1], 16) / 255;
          color.b = parseInt(colorRGB16[2], 16) / 255;

          resetColor( current.layers() );
        }
        else{
          alert( 'Error, Must be Color HEX!' );
        }
  },
  unit: function( type ){
    // 0: x.75, LDPI
    // 1: x1, 160dpi MDPI
    // 2: x1.5, 240dpi HDPI
    // 3: x2, 320dpi XHDPI
    // 4: x3, 480dpi XXHDPI
    // 5: x4, 640dpi XXXHDPI
    var self = this,
        current = MUGlobal.current,
        resetUnit = function( layers ){
          var layers = layers;
          layers.each(function( layer ){
            if( layer.class() == MSLayerGroup && layer.name().match(/\$Guide\-\d+/) ){
              var guideItems = layer.layers();
              guideItems.each(function( item ){
                var length = item.name() + '';

                if( item.class() == MSTextLayer && length.match(/\d+/) ){

                  var number = ( type == 'px' )? length: parseInt( length / scale[type] ),
                      unit = ( type == 'px' )? 'px': 'dp',
                      text = item.stringValue().replace( /(\d+\s[dxps]{2})/g, number + ' ' + unit),
                      x = item.frame().x(),
                      y = item.frame().y(),
                      width = item.frame().width(),
                      newItem = layer.addLayerOfType('text');

                  newItem.name = length;
                  newItem.setStringValue( text );
                  newItem.setFontSize( MUGlobal.font.size );
                  newItem.setFontPostscriptName( MUGlobal.font.family );
                  newItem.style().fills().addNewStylePart();
                  self.setColor( newItem, MUGlobal.font.color.r, MUGlobal.font.color.g, MUGlobal.font.color.b );

                  newItem.frame().setX( parseInt( x + ( ( width - newItem.frame().width() ) / 2 ) ) );
                  newItem.frame().setY( y );

                  layer.removeLayer( item );
                }
              });
            }
            else if( layer.class() == MSLayerGroup ){
              resetUnit( layer.layers() );
            }

          });
        },
        scale = [
          .75,
          1,
          1.5,
          2,
          3,
          4
        ];

    resetUnit( current.layers() );

  }
};
