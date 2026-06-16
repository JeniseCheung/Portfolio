// -------------------- Active Links --------------------
const sections = document.querySelectorAll(".categories");
const navLi = document.querySelectorAll(".nav-colour");
window.onscroll = () => {
  var current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 60) {
      current = section.getAttribute("id"); }
  });

  navLi.forEach((li) => {
    li.classList.remove("active");
    if (li.getAttribute("href") === `#${current}`) {
      li.classList.add("active");
    }
  });
};

// -------------------- Smooth Scrolling --------------------
$(document).ready(function(){
  $('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if( target.length ) {
      event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top
      }, 500);
    }
  });
});

// -------------------- Hamburger --------------------
const toggler = document.querySelector('.toggler');
if (toggler) {
  toggler.addEventListener('click', function() {
    document.querySelector('.animated-icon1').classList.toggle('open');
    document.querySelector('body').classList.toggle('no-scroll');
  });
}

// Going back
window.addEventListener('pageshow', function () {
  if (toggler) toggler.checked = false;
});

// Home Page - Work Navigation
const navLinks = document.querySelectorAll('.button-nav');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (toggler) toggler.checked = false;

    // reset hamburger animation
    document.querySelector('.animated-icon1')
      .classList.remove('open');

    // scrolling
    document.body.classList.remove('no-scroll');
  });
});

// -------------------- Top Button --------------------
var btn = $('.top-button');
if (btn.length) {
  $(window).scroll(function() {
    if ($(window).scrollTop() > 200) {
      btn.addClass('show');
    } else {
      btn.removeClass('show');
    }
  });

  btn.on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({scrollTop:0}, '200');
  });
}

// -------------------- Carousel --------------------
// Grab every carousel separately
document.querySelectorAll('.carousel').forEach(setupCarousel);

function setupCarousel(carousel) {
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.go');
  const imgs = carousel.querySelectorAll('.carousel-img');
  const dots = carousel.querySelectorAll('.dot');
  const captions = carousel.querySelectorAll('.carousel-caption');

  let imgPosition = 0;
  const totalImgs = imgs.length;

  function updatePosition (){
    imgs.forEach(img => {
      img.classList.remove('visible');
      img.classList.add('hidden');
    });
    imgs[imgPosition].classList.remove('hidden');
    imgs[imgPosition].classList.add('visible');

    dots.forEach(dot => dot.className = dot.className.replace(" live", ""));
    if (dots[imgPosition]) dots[imgPosition].classList.add('live');

    captions.forEach(caption => {
      caption.classList.remove('visible');
      caption.classList.add('hidden');
    });
    if (captions[imgPosition]) {
      captions[imgPosition].classList.remove('hidden');
      captions[imgPosition].classList.add('visible');
    }
  }

  function nextImg() {
    imgPosition = (imgPosition + 1) % totalImgs;
    updatePosition();
  }

  function prevImg() {
    imgPosition = (imgPosition - 1 + totalImgs) % totalImgs;
    updatePosition();
  }

  next.addEventListener('pointerup', nextImg);
  prev.addEventListener('pointerup', prevImg);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      imgPosition = i;
      updatePosition();
    });
  });
}

//Carousel
var bigImg = document.querySelector('.big-img img');
function showImg(pic) {
  if (bigImg) {
    bigImg.src = pic;
  }
}

// -------------------- Modal --------------------
var modal = document.getElementById('myModal');

if (modal) {
  var span = document.getElementsByClassName('close')[0];
  //var images = document.getElementsByTagName('img');
  var images = document.querySelectorAll('.border_img img, .extra, .big-img img, .process-img, .pointer img');
  var modalImg = document.getElementById('img01');
  var captionText = document.getElementById('caption');

  var prev = document.querySelector('.modal .prev');
  var next = document.querySelector('.modal .go');
  var imageList = [];
  var currentIndex = 0;

  var containerEl = document.querySelector( '.modal' );
  var contentEl = document.querySelector( '.modal-content' );
  var workspace = PanZoom( contentEl, containerEl );

  // Loop through all images and add click
  for (let i = 0; i < images.length; i++) {
    imageList.push(images[i]);

    images[i].onclick = function() {
      currentIndex = imageList.indexOf(this);
      openModal(currentIndex);
    }
  }

  function openModal(index) {
    modal.style.display = "block";
    modalImg.src = images[index].src;
    modalImg.alt = images[index].alt;
    document.body.style.overflow = 'hidden';

    // Scroll to the image
    images[index].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    if (images[index].nextElementSibling && images[index].nextElementSibling.classList.contains("desc")) {
      captionText.innerHTML = images[index].nextElementSibling.innerHTML;
    } else {
      captionText.innerHTML = images[index].alt;
    }
  }

  // Arrow buttons
  function nextImg() {
    currentIndex = (currentIndex + 1) % images.length;
    openModal(currentIndex);
    workspace.reset();
  }

  function prevImg() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openModal(currentIndex);
    workspace.reset();
  }

  next.addEventListener('click', nextImg);
  prev.addEventListener('click', prevImg);
  
  // Close button click
  if (span) {
    span.onclick = function() { 
      modal.style.display = 'none';
      document.body.style.overflow = '';
      workspace.reset();
    }
  }

  //Zoom
  function PanZoom ( targetEl, containerEl, opts ) {
    if ( ! ( this instanceof PanZoom ) ) {
      return new PanZoom ( targetEl, containerEl, opts );
    }
    
    opts = opts || { }

    var shouldCaptureFn = opts.shouldCaptureFn || function (el) {
      return !el.closest('.prev, .go, .close');
    };

    var limitToContainer = false;
    var limitPadding = opts.limitPadding || 50;

    var dx = 0;
    var dy = 0;
    var scale = 1;
    var active = 0;
    var lastPoints = [ ];
    var containerBounds;
    
    containerEl.addEventListener( 'mousedown', pointerPressed );
    containerEl.addEventListener( 'touchstart', pointerPressed );
    containerEl.addEventListener( 'wheel', wheelTurned );

    window.addEventListener( 'resize', resized );

    updateContainerBounds();
    
    function reset () {
      targetEl.style.WebkitTransformOrigin = targetEl.style.transformOrigin = '50% 50%';
      dx = 0;
      dy = 0;
      scale=1;
      update();
    }

    function updateValues ( newDx, newDy, newScale, targetBounds ) {
      if ( limitToContainer && targetEl !== containerEl && containerBounds ) {
        targetBounds = targetBounds || targetEl.getBoundingClientRect();
                  
        if ( newDx !== dx || newDy !== dy || newScale !== scale ) {
          var scaleDelta = 1 / ( scale / newScale );
        
          if ( newDx + targetBounds.width * scaleDelta < limitPadding ) {
            newDx = limitPadding - targetBounds.width * scaleDelta;
          }

          if ( newDx > containerBounds.width - limitPadding ) {
            newDx = containerBounds.width - limitPadding;
          }
        
          if ( newDy + targetBounds.height * scaleDelta < limitPadding ) {
            newDy = limitPadding - targetBounds.height * scaleDelta;
          }

          if ( newDy > containerBounds.height - limitPadding ) {
            newDy = containerBounds.height - limitPadding;
          }
        }
      }

      dx = newDx;
      dy = newDy;
      scale = newScale;
    }

    function update () {
      targetEl.style.WebkitTransform = targetEl.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0) scale(' + scale + ')';
    }

    function wheelTurned ( event ) {
      if ( ! shouldCaptureFn( event.target ) ) { return; }
      event.preventDefault();

      targetEl.style.WebkitTransformOrigin = targetEl.style.transformOrigin = '0 0';

      var targetBounds = targetEl.getBoundingClientRect();
      var delta = event.deltaY;
      delta *= -1;
      if ( event.deltaMode === 1 ) {
        delta *= 15;
      }

      delta = Math.max( Math.min( delta, 60 ), -60 );

      var scaleDiff = ( delta / 300 ) + 1;

      if ( scale * scaleDiff < 0.05 ) { return; }


      updateValues(
        dx - (event.clientX - targetBounds.left) * (scaleDiff - 1),
        dy - (event.clientY - targetBounds.top) * (scaleDiff - 1),
        scale * scaleDiff,
        targetBounds

      );

      update();
    }

    function firstPointerPressed ( event ) {
      document.addEventListener( 'mousemove', pointerMoved );
      document.addEventListener( 'mouseup', pointerReleased );
      document.addEventListener( 'touchmove', pointerMoved );
      document.addEventListener( 'touchend', pointerReleased );
    }

    function pointerPressed ( event ) {
      if ( event.type == 'mousedown' && event.which != 1 ) {
        return;
      }
      
      if ( ! shouldCaptureFn( event.target ) ) {
        return;
      }
      
      if (!event.target.closest('.prev, .go, .close')) {
        event.preventDefault();
      }

      lastPoints = getPoints( event );
      active++;
    
      if ( active === 1 ) {
        firstPointerPressed( event );
      }
    }

    function pointerMoved ( event ) {
      event.preventDefault();

      var points = getPoints( event );
      var averagePoint = points.reduce( getMidpoint );
      var averageLastPoint = lastPoints.reduce( getMidpoint );
      var targetBounds = targetEl.getBoundingClientRect();

      var tmpX = dx + averagePoint.x - averageLastPoint.x;
      var tmpY = dy + averagePoint.y - averageLastPoint.y;
      
      if ( points[1] ) {
        var scaleDiff = touchDistance( points[0], points[1] ) / touchDistance( lastPoints[0], lastPoints[1] );
        
        updateValues(
          tmpX - ( averagePoint.x - targetBounds.left ) * ( scaleDiff - 1 ),
          tmpY - ( averagePoint.y - targetBounds.top ) * ( scaleDiff - 1 ),
          scale * scaleDiff,
          targetBounds
        );
      } else {
        updateValues( tmpX, tmpY, scale );
      }
      

      update();
      lastPoints = points;
    }

    function pointerReleased ( event ) {
      event.preventDefault();
      active--;
      lastPoints.pop();

      if ( active ) {
        lastPoints = getPoints( event );
        return;
      }

      document.removeEventListener( 'mousemove', pointerMoved );
      document.removeEventListener( 'mouseup', pointerReleased );
      document.removeEventListener( 'touchmove', pointerMoved );
      document.removeEventListener( 'touchend', pointerReleased );
    }

    function updateContainerBounds () {
      containerBounds = containerEl.getBoundingClientRect();
      updateValues( dx, dy, scale );
      update();
    }

    function resized () {
      updateContainerBounds();
    }

    this.reset = reset;
  }

  function getXY ( obj ) {
    return {
      x: obj.pageX,
      y: obj.pageY
    };
  }

  function touchDistance ( touch1, touch2 ) {
    var dx = Math.abs( touch2.x - touch1.x );
    var dy = Math.abs( touch2.y - touch1.y );
    return Math.sqrt( dx * dx + dy * dy );
  }

  function getMidpoint ( point1, point2 ) {
    return {
      x: ( point1.x + point2.x ) / 2,
      y: ( point1.y + point2.y ) / 2
    };
  }

  function getPoints ( event ) {
    if ( event.touches ) {
      return Array.prototype.map.call( event.touches, getXY );
    }
    else {
      return [ getXY( event ) ];
    }
  }

  // Reset button    
  $('#image-zoom').on('click', function() {
    workspace.reset();
  });
}

// --------------------  Progress Bar --------------------
const progressBar = document.getElementById("progressbar");
  if (progressBar) {
  progressBar.style.height = 1 + "%";

  window.onscroll = () => {
    const scroll = document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (scroll / height) * 100;

    if (scrolled <= 1) {
      progressBar.style.height = 1 + "%";
    } else {
      progressBar.style.height = scrolled + "%";
    }
  };
}

// --------------------  Fish Cursor --------------------
const cursorBorder = document.querySelector("#cursor-border");
const cursorPos = { x: 0, y: 0 };
const cursorBorderPos = { x: 0, y: 0 };


const border = document.getElementById("minesweeper");

document.addEventListener("pointermove", (e) => {
  //cursorPos.x = e.clientX;
  //cursorPos.y = e.clientY;

  //cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

  if (border){
    const rect = border.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    )
    {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;
    }
  }
  else{
    cursorPos.x = e.clientX;
    cursorPos.y = e.clientY;
  }
});

requestAnimationFrame(function loop() {
  const easting = 8; 

  cursorBorderPos.x += (cursorPos.x - cursorBorderPos.x) / easting;
  cursorBorderPos.y += (cursorPos.y - cursorBorderPos.y) / easting;

  // Direction to mouse
  const dx = cursorPos.x - cursorBorderPos.x;
  const dy = cursorPos.y - cursorBorderPos.y;

  // Flip if moving Right
  facingRight = dx > 0;

  // Angle in degrees
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (!facingRight) angle += 180;

  // Apply transform: move, rotate, flip
  cursorBorder.style.transform = `translate(${cursorBorderPos.x}px, ${cursorBorderPos.y}px) rotate(${angle}deg) scaleX(${facingRight ? -1 : 1})`;

  requestAnimationFrame(loop);
});


// ------- COLOURS --------------------
if (window.location.href.includes('adventureawaits.html')) {
  document.documentElement.style.setProperty('--primary-color', '#84A37B');
  document.documentElement.style.setProperty('--background-color', '#E0E8DE');
  document.documentElement.style.setProperty('--link-color', '#50a85e');
  document.documentElement.style.setProperty('--secondary-color', '#4AA8CF');

  //mark
  document.documentElement.style.setProperty('--mark-color', '#D0ECF4'); 

} else if (window.location.href.includes('blossom.html')) {
  document.documentElement.style.setProperty('--primary-color', '#577b54'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#a93e1e'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#f0f0f0'); // background
  document.documentElement.style.setProperty('--border-color', '#3E4F3C');
  document.documentElement.style.setProperty('--button-color', '#8A8D56');
  document.documentElement.style.setProperty('--transparent-color', '#77a47e31');
  document.documentElement.style.setProperty('--quote-color', '#8A8D56');

//Hover links
document.documentElement.style.setProperty('--visited-color', '#3E4F3C');  
document.documentElement.style.setProperty('--link-color', '#337e15');  
document.documentElement.style.setProperty('--hover-color', '#337e15a2');
document.documentElement.style.setProperty('--mark-color', '#e5e9ae'); //mark

} else if (window.location.href.includes('prosper.html')) {
  document.documentElement.style.setProperty('--primary-color', '#264285'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#C7554F'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#E9F1FC'); // background
  document.documentElement.style.setProperty('--border-color', '#2D3F68');
  document.documentElement.style.setProperty('--button-color', 'rgb(74, 100, 162)');
  document.documentElement.style.setProperty('--transparent-color', '#7777a454');

  //Hover links
  document.documentElement.style.setProperty('--visited-color', 'rgb(45, 74, 135)');  
  document.documentElement.style.setProperty('--link-color', '#123C9A');  
  document.documentElement.style.setProperty('--hover-color', '#a6b5d5ff');
  document.documentElement.style.setProperty('--mark-color', '#F4CAC9'); //mark



  //Games-----


} else if (window.location.href.includes('simulation.html')) {
    document.documentElement.style.setProperty('--primary-color', '#2D3F68'); // navy blue
    document.documentElement.style.setProperty('--secondary-color', '#403837'); // h2 text colour
    document.documentElement.style.setProperty('--background-color', '#F3F3F3'); // background
    document.documentElement.style.setProperty('--border-color', '#2D3F68');
    document.documentElement.style.setProperty('--button-color', '#3d548bff');
    document.documentElement.style.setProperty('--transparent-color', '#7777a454');

  //Hover links
  document.documentElement.style.setProperty('--visited-color', '#263555ff');  
  document.documentElement.style.setProperty('--link-color', '#123C9A');  
  document.documentElement.style.setProperty('--hover-color', '#a6b5d5ff');
  document.documentElement.style.setProperty('--mark-color', '#D2DADA'); //mark
 
} else if (window.location.href.includes('carpdiem.html')) {
  document.documentElement.style.setProperty('--primary-color', '#137589'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#102e69'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#e9f3fc'); // background
  document.documentElement.style.setProperty('--border-color', '#0b4854');
  document.documentElement.style.setProperty('--button-color', '#7ea7ad'); 
  document.documentElement.style.setProperty('--transparent-color', '#77a49d31');

  //Hover links
  document.documentElement.style.setProperty('--visited-color', '#157e73');   //also button Border
  document.documentElement.style.setProperty('--link-color', '#157e7c');  
  document.documentElement.style.setProperty('--hover-color', 'rgb(166, 208, 213)');
  document.documentElement.style.setProperty('--mark-color', '#ccdde4'); //mark

  //Visual Experiences -----
} else if (window.location.href.includes('flicker.html')) {
  document.documentElement.style.setProperty('--primary-color', '#0c3c69'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#2b543b'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#e6e9ef'); // background
  document.documentElement.style.setProperty('--border-color', '#2b543b');
  document.documentElement.style.setProperty('--transparent-color', '#77a48e31');

  //Hover links
  document.documentElement.style.setProperty('--link-color', '#157e41');  
  document.documentElement.style.setProperty('--button-color', '#486457'); 
  document.documentElement.style.setProperty('--visited-color', '#0f4024'); 
  document.documentElement.style.setProperty('--hover-color', 'rgb(166, 213, 179)');
  document.documentElement.style.setProperty('--mark-color', '#cce4d1'); //mark

} else if (window.location.href.includes('venice.html')) {
  document.documentElement.style.setProperty('--primary-color', '#363274'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#48429B'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#f0f0f0'); // background
  document.documentElement.style.setProperty('--border-color', '#2b4154');
  document.documentElement.style.setProperty('--transparent-color', '#779fa431');

  //Hover links
  document.documentElement.style.setProperty('--link-color', '#2f157e');  
  document.documentElement.style.setProperty('--button-color', '#7e81ad'); 
  document.documentElement.style.setProperty('--visited-color', '#1d0f40'); 
  document.documentElement.style.setProperty('--hover-color', 'rgb(167, 166, 213)');
  document.documentElement.style.setProperty('--mark-color', '#d5d5e3'); //mark


} else if (window.location.href.includes('currents.html')) {
  document.documentElement.style.setProperty('--primary-color', '#115974'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#5d5d5d'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#e6eeef'); // background
  document.documentElement.style.setProperty('--border-color', '#2b4154');
  document.documentElement.style.setProperty('--transparent-color', '#779fa431');

  //Hover links
  document.documentElement.style.setProperty('--link-color', '#156c7e');  
  document.documentElement.style.setProperty('--button-color', '#7ea3ad'); 
  document.documentElement.style.setProperty('--visited-color', '#0f2f40'); 
  document.documentElement.style.setProperty('--hover-color', 'rgb(166, 204, 213)');
  document.documentElement.style.setProperty('--mark-color', '#e4e4cc'); //mark

  // Community
} else if (window.location.href.includes('ctl.html')) {
  document.documentElement.style.setProperty('--primary-color', '#891359'); // navy blue
  document.documentElement.style.setProperty('--secondary-color', '#391069'); // h2 text colour
  document.documentElement.style.setProperty('--background-color', '#e9ebfc'); // background
  document.documentElement.style.setProperty('--border-color', '#391069');
  document.documentElement.style.setProperty('--button-color', '#a67ead'); 
  document.documentElement.style.setProperty('--transparent-color', '#08060831');

  //Hover links
  document.documentElement.style.setProperty('--link-color', '#7e1579');  
  document.documentElement.style.setProperty('--visited-color', '#400f3b'); 
  document.documentElement.style.setProperty('--hover-color', 'rgb(210, 166, 213)');
  document.documentElement.style.setProperty('--mark-color', '#e0cce4'); //mark
}