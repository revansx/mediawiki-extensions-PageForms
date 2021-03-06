/**
 * Javascript handler for the autoedit parser function
 *
 * @author Stephan Gambke
 */

/*global confirm */

( function ( $, mw ) {

	'use strict';

	var autoEditHandler = function handleAutoEdit(){
	
		if ( mw.config.get( 'wgUserName' ) === null &&
			! confirm( mw.msg( 'pf_autoedit_anoneditwarning' ) ) ) {

			return;
		}

		var jtrigger = jQuery( this );
		var jautoedit = jtrigger.closest( '.autoedit' );
		var jresult = jautoedit.find( '.autoedit-result' );

                // console.log($(this));
                // console.log(this);
                // alert( jtrigger.html().includes("Click to approve") );

                if ( jtrigger.html().includes("Click to approve") > 0 ) {
                        var zClick2Confirm = confirm("The button you just clicked labeled \n\n[" + jtrigger.text()  + "]\n\n is about to make an edit on your behalf. If you are sure you want to proceed with this edit, click OK.");
                        if (zClick2Confirm) { } else { return; }
                }
		
		var reload = jtrigger.hasClass( 'reload' );

		jtrigger.attr( 'class', 'autoedit-trigger autoedit-trigger-wait' );
		jresult.attr( 'class', 'autoedit-result autoedit-result-wait' );

		jresult.text( mw.msg( 'pf-autoedit-wait' ) );


		// data array to be sent to the server
		var data = {
			action: 'pfautoedit',
			format: 'json'
		};

		// add form values to the data
		data.query =  jautoedit.find( 'form.autoedit-data' ).serialize();

		$.ajax( {

			type:     'POST', // request type ( GET or POST )
			url:      mw.util.wikiScript( 'api' ), // URL to which the request is sent
			data:     data, // data to be sent to the server
			dataType: 'json', // type of data expected back from the server
			success:  function ( result ){
				jresult.empty().append( result.responseText );

				if ( result.status === 200 ) {

					if ( reload ) {
						window.location.reload();
					}

					jresult.removeClass( 'autoedit-result-wait' ).addClass( 'autoedit-result-ok' );
					jtrigger.removeClass( 'autoedit-trigger-wait' ).addClass( 'autoedit-trigger-ok' );
				} else {
					jresult.removeClass( 'autoedit-result-wait' ).addClass( 'autoedit-result-error' );
					jtrigger.removeClass( 'autoedit-trigger-wait' ).addClass( 'autoedit-trigger-error' );
				}
			}, // function to be called if the request succeeds
			error:  function ( jqXHR, textStatus, errorThrown ) {
				var result = jQuery.parseJSON(jqXHR.responseText);
				var text = result.responseText;

				for ( var i = 0; i < result.errors.length; i++ ) {
					text += ' ' + result.errors[i].message;
				}

				jresult.empty().append( text );
				jresult.removeClass( 'autoedit-result-wait' ).addClass( 'autoedit-result-error' );
				jtrigger.removeClass( 'autoedit-trigger-wait' ).addClass( 'autoedit-trigger-error' );
			} // function to be called if the request fails
		} );
	};

	jQuery( document ).ready( function ( $ ) {
		$( '.autoedit-trigger' ).click( autoEditHandler );
	} );

}( jQuery, mediaWiki ) );
