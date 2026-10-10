/*
	MET photo viewer
	Tap/click a photo to see it full screen. Swipe or use the arrows / keyboard
	to move between the photos on the page; tap outside, press Esc or × to close.
	Photos inside links (cards, covers), the map and the home-page spotlights are left alone.
*/
(function () {
	'use strict';

	var photos = Array.prototype.filter.call(document.querySelectorAll('#wrapper img'), function (img) {
		return !img.closest('a') &&
			!img.closest('.spotlights') &&
			!img.hasAttribute('usemap');
	});
	if (!photos.length) return;

	var current = 0, lastFocus = null, byKeyboard = false, touchX = null, touchY = null;

	// ---- build the viewer once ----
	var box = document.createElement('div');
	box.className = 'lb';
	box.setAttribute('role', 'dialog');
	box.setAttribute('aria-modal', 'true');
	box.setAttribute('aria-label', 'Photo viewer');
	box.hidden = true;
	box.innerHTML =
		'<figure class="lb-figure">' +
			'<img class="lb-img" alt="">' +
			'<figcaption class="lb-caption"></figcaption>' +
		'</figure>' +
		'<button type="button" class="lb-btn lb-close" aria-label="Close">&times;</button>' +
		'<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>' +
		'<button type="button" class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>' +
		'<div class="lb-count" aria-live="polite"></div>';
	document.body.appendChild(box);

	var bigImg = box.querySelector('.lb-img'),
		caption = box.querySelector('.lb-caption'),
		count = box.querySelector('.lb-count'),
		btnClose = box.querySelector('.lb-close'),
		btnPrev = box.querySelector('.lb-prev'),
		btnNext = box.querySelector('.lb-next');

	if (photos.length < 2) {
		btnPrev.hidden = true;
		btnNext.hidden = true;
	}

	function show(i) {
		current = (i + photos.length) % photos.length;
		var src = photos[current];
		bigImg.classList.add('lb-loading');
		bigImg.onload = function () { bigImg.classList.remove('lb-loading'); };
		bigImg.src = src.currentSrc || src.src;
		bigImg.alt = src.alt || '';
		caption.textContent = src.alt || '';
		count.textContent = photos.length > 1 ? (current + 1) + ' / ' + photos.length : '';
		// warm the cache for the neighbours
		[current + 1, current - 1].forEach(function (n) {
			var p = photos[(n + photos.length) % photos.length];
			if (p && p.src) { var pre = new Image(); pre.src = p.src; }
		});
	}

	function open(i, keyboard) {
		byKeyboard = !!keyboard;
		lastFocus = document.activeElement;
		show(i);
		box.hidden = false;
		// next frame so the fade-in transition runs
		requestAnimationFrame(function () { box.classList.add('lb-open'); });
		document.documentElement.classList.add('lb-lock');
		btnClose.focus({ preventScroll: true });
	}

	function close() {
		box.classList.remove('lb-open');
		document.documentElement.classList.remove('lb-lock');
		setTimeout(function () { box.hidden = true; bigImg.removeAttribute('src'); }, 200);
		// hand focus back only for keyboard users (avoids a stray outline after a tap)
		if (byKeyboard && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
		else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
	}

	// ---- make the page photos clickable ----
	photos.forEach(function (img, i) {
		img.classList.add('lb-zoomable');
		img.setAttribute('tabindex', '0');
		img.setAttribute('role', 'button');
		img.setAttribute('aria-label', 'Enlarge photo' + (img.alt ? ': ' + img.alt : ''));
		img.addEventListener('click', function () { open(i); });
		img.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, true); }
		});
	});

	// ---- controls ----
	btnClose.addEventListener('click', close);
	btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
	btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
	box.addEventListener('click', function (e) {
		if (e.target === box || e.target.classList.contains('lb-figure')) close();
	});

	document.addEventListener('keydown', function (e) {
		if (box.hidden) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft' && photos.length > 1) show(current - 1);
		else if (e.key === 'ArrowRight' && photos.length > 1) show(current + 1);
		else if (e.key === 'Tab') {
			// keep focus inside the viewer
			var f = [btnClose, btnPrev, btnNext].filter(function (b) { return !b.hidden; });
			var idx = f.indexOf(document.activeElement);
			e.preventDefault();
			f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
		}
	});

	// ---- swipe on phones ----
	box.addEventListener('touchstart', function (e) {
		if (e.touches.length !== 1) { touchX = null; return; }
		touchX = e.touches[0].clientX;
		touchY = e.touches[0].clientY;
	}, { passive: true });

	box.addEventListener('touchend', function (e) {
		if (touchX === null) return;
		var dx = e.changedTouches[0].clientX - touchX,
			dy = e.changedTouches[0].clientY - touchY;
		touchX = null;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && photos.length > 1) {
			show(current + (dx < 0 ? 1 : -1));
		} else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
			close(); // swipe down to close
		}
	}, { passive: true });
})();
