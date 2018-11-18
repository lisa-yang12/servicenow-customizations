/*
# Run a Response Play from a ServiceNow Incident
#
# (From SNOW Training for ES with Sean Higgins, Nov. 2018)
#
# Customizations: 
# - Update to PagerDuty Script Include file
# - New UI Action
# 
# Requires: Response Play ID
#
#
*/

runResponsePlay: function (incident) {
		var pd = new x_pd_integration.PagerDuty();
        var userEmail = pd.getValidEmail(gs.getUserID());
        var rest = new x_pd_integration.PagerDuty_REST();

		//feature = API endpiont to hit
        var feature = 'response_plays/<RESPONSE_PLAY_ID>/run';

		// helper function to get incident ID from SNOW incident
		var incidentID = x_pd_integration.TaskEntityHelper.getPdId(incident);
		gs.debug("The incidentID is: " + incidentID);
		var postBody = {
           "incident": {
               "id": '"' + incidentID + '"',
               "type": "incident_reference"
           }
       };
		gs.debug("The postBody is: " + postBody);
		
		var response = rest.postREST(feature, postBody, userEmail);
        
		var body = this.JSON.decode(response.getBody());
        
		var status = response.getStatusCode();
        gs.debug("Successfully ran the response play!");

        if (response.haveError()) {
            var errCode = body.error.code;
            var errors = body.error.errors.toString();
            var errorMessage = 'error: ' + body.error.message;

            this._setError(me, errCode + ':' + errorMessage + ':' + errors);
            return;
        }

        if (status == 200 || status == 201) {
            gs.debug('{0} body.user = {1}', me, this.JSON.encode(body.user));
            var userId = body.user.id;
            gs.debug('{0} userId = {1}', me, userId);

            this._updateUser(user, userId);
            return userId;

        } else {
            this._setError(me, 'unknown error, (' + status + ') body:' + response.getBody());
        }
		
	}
	
	
/*
# UI Action
#
# Action Name: (Shows up on Form Button) Run <NAME> Response Play
# Condition: !gs.nil(current.x_pd_integration_incident)
#
# Form Button
#
*/	

var pdp = new x_pd_integration.PagerDuty();
pdp.runResponsePlay(current);
gs.addInfoMessage("Successfully ran Response Play");