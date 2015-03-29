import config from '../config/environment';
import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Object.extend({  /**
   * Resolve the user over the Github API using the token
   * @param  token      API token (either from Cookie or Oauth)
   * @return Promise
   */
  resolveUser (token) {
    this.github.setToken(token);

    return this.github.request('/user', 'get').then((user) => {
      localStorage.setItem('fiddle_gh_session', token);
      return { currentUser: user };
    });
  },

  /**
   * Try loading the user from cookie
   * @return Promise
   */
  fetch () {
    var token = localStorage.getItem('fiddle_gh_session');

    if(Em.isBlank(token)) { return Em.RSVP.reject(); }

    return this.resolveUser(token);
  },

  /**
   * Open a new session, authenticate with Github
   * @return Promise
   */
  open (authorization) {
    return ajax({
      url: config.githubOauthUrl + authorization.authorizationCode,
      dataType: 'json',
    }).then(this.resolveUser);
  }
});