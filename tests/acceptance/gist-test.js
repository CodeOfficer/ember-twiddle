import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ember-twiddle/tests/helpers/start-app';

let application;
let cacheConfirm;

const firstFilePicker = '.code:first-of-type .dropdown-toggle';
const secondFile = '.code:first-of-type .dropdown-menu li:nth-child(2) a';
const fileMenu = '.file-menu .dropdown-toggle';
const firstColumn = '.code:first-of-type';
const deleteAction = '.file-menu a:contains(Delete)';

module('Acceptance | gist', {
  beforeEach: function() {
    application = startApp();
    cacheConfirm = window.confirm;
    window.confirm = () => true;
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    window.confirm = cacheConfirm;
  }
});

test('deleting a gist loaded in two columns', function(assert) {
  visit('/');
  click(firstFilePicker);
  click(secondFile);
  click(firstFilePicker);
  click(fileMenu);
  click(deleteAction);
  andThen(function() {
    assert.equal(find('.code .CodeMirror').length, 0, 'No code mirror editors active');
  });
});
