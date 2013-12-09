<h1 id="project-id">{{dir}}</h1>

<hr>

<label>Deploy Hook URL (POST)</label>
<pre id="project-hook">{{hook}}</pre>

{{#if key}}
<label>Server Deploy Key</label>
<pre>{{key}}</pre>
{{/if}}

<hr>

<form id="project-config">

	<h4>Repository</h4>
	
	<input name="id" type="hidden" value="{{dir}}">
	
	{{#if repo}}
	<p>{{repo}}</p>
	{{else}}
	<input id="project-repo" name="repo" type="text" placeholder="user@path-to-git/repo.git">
	{{/if}}
	
	<hr>
	
	<h4>View Authentication</h4>
	<p><em>Leave fields blank for no authentication</em></p>
	
	<br>
	
	<label>View User</label>
	<input name="user" type="text" value="{{auth.user}}">
	
	<label>View Password</label>
	<input name="pass" type="text" value="{{auth.pass}}">
	
	<button>Save</button>

</form>

<hr>

<h4>Delete This Project</h4>

<p>Deleting the project will remove it, all logs, and the current build from the system.</p>

<br>

<button id="project-confirm-delete" class="hide btn-left">Confirm Delete</button>
<button id="project-cancel-delete" class="hide btn-right">Cancel</button>
<button id="project-delete">Delete Project</button>