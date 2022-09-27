/**
 * Scroll and mouse animations
 * @copyright 2022 Least imperfect Pte Ltd
 * @link https://github.com/leastimperfect/mouse-and-scroll
 * @author shramee@leastimperfect.com
 */

export default class ScrollAndMouse {
	scrollTargets = [];

	centerWidth = .3

	constructor( scrollSelector, watchMouse ) {
		scrollSelector && this.watchScroll( scrollSelector );
		watchMouse && this.watchMouse();
	}

	watchMouse() {
		document.body.style.setProperty( '--mX', 0 );
		document.body.style.setProperty( '--mY', 0 );

		document.addEventListener( 'mousemove', function ( e ) {
			var
				x = (2 * e.clientX / window.innerWidth) - 1,
				y = (2 * e.clientY / window.innerHeight) - 1;
			document.body.style.setProperty( '--mX', x );
			document.body.style.setProperty( '--mY', y );
		} );
	}

	watchScrollOutOfView( target ) {
		target.inView = false;
		target.el.removeAttribute("data-in-view");
	}

	watchScrollCb( e ) {
		let docHeight = window.innerHeight;
		for ( let i = 0; i < this.scrollTargets.length; ++ i ) {
			const target = this.scrollTargets[i];
			let {el, offset, inView, scrollPos} = target;
			const boundingBox      = el.getBoundingClientRect();
			const height           = boundingBox.height;
			const top              = boundingBox.top;
			const scrollArea = docHeight + height;
			const clearScrollProps = ( cb ) => {
				inView = target.inView = false;
				el.removeAttribute("data-in-view");
				el.style.setProperty( '--scroll', Math.round( scrollPos ) );
				el.style.setProperty( '--scroll-low', Math.round( Math.max( 0, (.35 - scrollPos) / .35 ) ) );
				el.style.setProperty( '--scroll-high', Math.round( Math.max( 0, (scrollPos - .65) / .35 ) ) );
				cb && cb();
			};

			if ( top >= docHeight ) {
				// Yet to come into view
				inView && clearScrollProps();
			} else if ( top <= - 1 * height ) {
				// Scrolled out of the view
				inView && clearScrollProps();
			} else {
				const scrollPos = (docHeight - top) / scrollArea;
				target.scrollPos = scrollPos;
				el.style.setProperty( '--scroll', scrollPos );
				const oldInView = inView;
				if ( scrollPos < .35 ) {
					inView = target.inView = 'low';
					el.style.setProperty( '--scroll-low', (.35 - scrollPos ) / .35 );
				} else if ( scrollPos < .65 ) {
					inView = target.inView = 'mid';
					el.style.setProperty( '--scroll', scrollPos );
					el.style.setProperty( '--scroll-low', 0 );
					el.style.setProperty( '--scroll-high', 0 );
				} else {
					inView = target.inView = 'high';
					el.style.setProperty( '--scroll', scrollPos );
					el.style.setProperty( '--scroll-high', (scrollPos - .65) / .35 );
				}

				if ( inView !== oldInView ) {
					// If there's a change in inView state
					el.setAttribute("data-in-view", inView);
				}
				// height + top will max out at docHeight + height
				el.style.setProperty( '--scroll', scrollPos );
			}
		}
	}

	watchScrollSetup() {
		if ( this.setupDone ) {
			return;
		}
		let queued = false;
		this.setupDone = true;
		window.addEventListener( 'scroll', e => {
			if ( !queued ) {
				window.requestAnimationFrame( () => {
					this.watchScrollCb( e );
					queued = false;
				} );
				queued = true;
			}
		} );
		this.watchScrollCb();
	}

	addScrollTarget( el ) {
		if( ! el ) {
			console.error( 'ScrollAndMouse.addScrollTarget requires element to watch.' )
			return;
		}
		const offset = el.dataset.scrollOffset || window.innerHeight / 5;
		const inView = false;
		this.scrollTargets.push( {el, offset, inView} );
		this.scrollTargets && this.watchScrollSetup();
	}

	watchScroll( selector ) {
		document.querySelectorAll( selector ).forEach( el => {
			const offset = el.dataset.scrollOffset || window.innerHeight / 5;
			const inView = false;
			this.scrollTargets.push( {el, offset, inView} );
		} );
		this.scrollTargets && this.watchScrollSetup();
	}

	staggerChildren( el, gapSeconds = .5, beginDelay = 0 ) {
		if( ! el ) return;
		[...el.children].forEach( (ch, i) => {
			ch.style.animationDelay = (beginDelay + i * gapSeconds) + 's'
		} )
	}
}

window && (window.ScrollAndMouse = ScrollAndMouse);
