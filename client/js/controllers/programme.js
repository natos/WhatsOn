/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/grid',
	'config/programme',
	'models/programme',
	'modules/event',
	'lib/flaco/controller',
	'views/programme',
	'utils/epgapi'

], function ProgrammeControllerScope(g, p, ProgrammeModel, Event, Controller, ProgrammeView, EpgApi) {


	var name = 'programme';

/* private */

	function handleProgrammeReceived(response) {

		console.log('<PROGRAMME CONTROLLER>', response);

		ProgrammeModel.set(p.PROGRAMME, response);

	}


/* public */

/* abstract */ 

	function initialize(State) {

		var id = State.parts[0];

		Event.on(p.PROGRAMME_RECEIVED, handleProgrammeReceived);

		EpgApi.getProgrammeFromAPI(id);

		return this;
	
	}

	function finalize() {

		Event.off(p.PROGRAMME_RECEIVED, handleProgrammeReceived);

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: ProgrammeView
	});

});