<h1 class="page-title">
  <i class="fa fa-folder"></i>
  <a href="/#/projects" class="breadcrumb-link">Projects</a>
  <span class="breadcrumb-active">{{_id}}</span>
  {{#unless restricted}}
  <a href="#/project/new" class="btn right"><i class="fa fa-plus-circle"></i>New Project</a>
  {{/unless}}
</h1>

<div class="content-wrap">
  <h1 class="project-title">{{_id}}</h1>

  <ul class="tabs-horiz">
    <li class="current-tab"><a href="#"><i class="fa fa-repeat"></i>Builds</a></li>
    <li><a href="#/pull-requests"><i class="fa fa-exchange"></i>Pull Requests</a></li>
    <li><a href="#/branches"><i class="fa fa-code-fork"></i>Branches</a></li>
    <li><a href="#/tags"><i class="fa fa-tags"></i>Tags</a></li>
  </ul>

  <table class="datatable">
    <thead>
      <tr>
        <th width="115">Status</th>
        <th>Message</th>
        <th>Commit</th>
        <th>Committer</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
    {{#each builds}}
      <tr data-build={{_id}}>
        <td>
          {{#compare state "failed" operator="==="}}
          <a href="#/{{project}}/builds/{{_id}}" title="Build Failed"><i class="fa fa-circle red"></i></a>
          {{/compare}}

          {{#compare state "passed" operator="==="}}
          <a href="#/{{project}}/builds/{{_id}}" title="Build Passed"><i class="fa fa-circle green"></i></a>
          {{/compare}}

          {{#compare state "running" operator="==="}}
          <a href="#/{{project}}/builds/{{_id}}" title="Running"><i class="fa fa-circle yellow"></i></a>
          {{/compare}}

          {{#compare state "pending" operator="==="}}
          <a href="#/{{project}}/builds/{{_id}}" title="Pending"><i class="fa fa-circle yellow"></i></a>
          {{/compare}}
        </td>
        <td></td>
        <td></td>
        <td>{{triggered_by}}</td>
        <td></td>
      </tr>
    {{/each}}
    </tbody>
  </table>

  <div class="sidebar">
    <section class="sidebar-glance-contain">
      <h3 class="sidebar-glance-title">At a Glance</h3>
      <p>6 authors have pushed 66 commits to all branches, excluding merges. On master, 70 files have changed and there have been 50,134 additions and 729 deletions.</p>
    </section>

    <section class="sidebar-list-contain">
      <h3 class="sidebar-list-title">Recent project builds</h3>

      <ul class="sidebar-list">
        <li><a href="#">
          <strong>jQuery/jQuery</strong> - <time>Feb 11, 2014</time>
          <span>Commit d792e40 by rwaldron</span>
        </a></li>
        <li><a href="#">
          <strong>guardian/frontend</strong> - <time>Feb 10, 2014</time>
          <span>Commit d792e40 by trevanhetzel</span>
        </a></li>
        <li><a href="#">
          <strong>jQuery/jQuery</strong> - <time>Feb 11, 2014</time>
          <span>Commit d792e40 by rwaldron</span>
        </a></li>
        <li><a href="#">
          <strong>guardian/frontend</strong> - <time>Feb 10, 2014</time>
          <span>Commit d792e40 by trevanhetzel</span>
        </a></li>
        <li><a href="#">
          <strong>jQuery/jQuery</strong> - <time>Feb 11, 2014</time>
          <span>Commit d792e40 by rwaldron</span>
        </a></li>
      </ul>

      <div class="sidebar-list-actions">
        <a href="#" class="btn btn-sml">View all</a>
      </div>
    </section>
  </div>
</div>

<!-- <div class="content-wrap">

  {{#if hook}}
  	<label>Deploy Hook URL (POST)</label>
  	<pre id="project-hook">{{hook}}</pre>
  {{/if}}

	{{#if key}}
  	<label>Server Deploy Key</label>
  	<pre>{{key}}</pre>
	{{/if}}

	<hr>

	<form id="project-config">

    <input name="_id" type="hidden" value="{{_id}}">
    <input name="_rev" type="hidden" value="{{_rev}}">

		<h4>Repository</h4>

		<input id="project-repo" required="true" name="repo" type="text" title="Enter the clone URL" placeholder="git://github.com/username/project.git" value="{{repo}}">

    <h4>Branch</h4>
    {{#if branch}}
    <input id="project-branch" required="true" name="branch" type="text" title="Enter the default branch" value="{{branch}}">
    {{else}}
    <input id="project-branch" name="branch" type="text" title="Default branch" placeholder="master" value="master">
    {{/if}}

    <label style="clear: both; display: inline">
      <input type="checkbox" name="public" class="checkbox" {{#if public}}checked{{/if}}>
      Public
    </label>


    {{#if _id}}
      <button class="btn-left">Save</button>
    {{else}}
    	<button class="btn-left">Create</button>
    {{/if}}

	</form>

	<hr>

	{{#if _id}}
		<h4>Delete This Project</h4>

		<p>Deleting the project will remove it, all logs, and the current build from the system.</p>

		<button id="project-confirm-delete" class="hide btn-left">Confirm Delete</button>
		<button id="project-cancel-delete" class="hide btn-right">Cancel</button>
		<button id="project-delete">Delete Project</button>

	{{/if}}


</div>
 -->