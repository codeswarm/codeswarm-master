define([
  'knockout',
  'request',
  'dom',
  'session',
  'utils/github',
  'plugins/router'
], function (ko, request, dom, session, github, router) {

  var ctor = {

    // Check that user is logged in
    canActivate: function () {
      session.isLoggedIn(function (sess) {
        if (!sess) {
          router.navigate('/user/login');
        }
      });
      // This is required for Durandal
      return true;
    },

    // Set displayName
    displayName: 'About CodeSwarm',

    // Define model
    projects: ko.observableArray(),
    org: ko.observable(),
    orgs: ko.observableArray(),
    token: ko.observable(),

    // Initialization
    activate: function (org) {
      this.orgs([]);
      this.org(org.toLowerCase());
      // Setup orgs list
      this.tryGetOrgs();
      // Load projects
      this.tryGetProjects();
    },

    // Github Integration ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    tryGetOrgs: function (user) {
      var self = this;
      // Push default (all)
      this.orgs.push('projects');
      github.gitUser(function (err, user) {
        user.orgs(function (err, orgs) {
          if (!err) {
            for (var i = 0, z = orgs.length; i < z; i++) {
              self.orgs.push(orgs[i].login.toLowerCase());
            }
            // Have to use jQuery because Durandal messes up the
            // observable assigned to 'value' on the view's <select> bindings
            // @TODO: FIX IT!
            $('#org-filter').on('change', function () {
              var goto = $(this).val();
              router.navigate(goto);
            }).find('option').filter(function () {
              return $(this).text() === self.org();
            }).prop('selected', true);
            // Apply custom select UI
            dom.customSelect('select');
          }
        });
      });
    },

    // Get Projects ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Define request
    projectsReq: {
      url: '/projects',
      type: 'GET'
    },

    tryGetProjects: function () {
      var self = this;
      // Make Request
      var req = request(this.projectsReq);

      // Empty observableArray
      this.projects([]);

      // On success
      req.done(function (data) {
        var org;
        for (var i = 0, z = data.length; i < z; i++) {
          org = data[i]._id.substr(0, data[i]._id.indexOf('/')).toLowerCase();
          if (self.org() === 'projects') {
            self.projects.push(data[i]);
          } else {
            if (org === self.org()) {
              self.projects.push(data[i]);
            }
          }
        }
      });

      // On failure
      req.fail(function (err) {
        dom.showNotification('error', JSON.parse(err.responseText).message);
      });
    }

  };

  return ctor;
});
