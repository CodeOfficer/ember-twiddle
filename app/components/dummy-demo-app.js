import Ember from 'ember';
import ResizeMixin from 'ember-twiddle/lib/resize-mixin';

export default Ember.Component.extend(ResizeMixin, {
  iframeId: 'dummy-content-iframe',

  didReceiveAttrs: function() {
    if(!this.element) {
      return;
    }

    if(this.element.firstElementChild) {
      this.element.removeChild(this.element.firstElementChild);
    }

    var ifrm = document.createElement('iframe');
    ifrm.id = this.iframeId;

    if (!Ember.testing) {
      ifrm.sandbox = 'allow-scripts allow-forms';
      ifrm.srcdoc = this.get('html');
    }

    this.element.appendChild(ifrm);

    if (Ember.testing) {
      ifrm = ifrm.contentWindow;
      ifrm.document.open();
      ifrm.document.write(this.get('html'));
      ifrm.document.close();
    }
  },

  didResize: function () {
    let offset = this.$().offset(), width = this.$().width(),
      height = this.$().height();

    Em.$('#demo-app').css({
      top:    offset.top,
      left:   offset.left,
      width:  width,
      height: height
    });
  }.on('didInsertElement')
});
