Vue.component('tabs', {
    template: '#template-tabs',
    data() {
      return {
        navItemsArray: []
      }
    },
    mounted() {
      this.navItemsArray = this.$children;
    },
    methods: {
      selectMenuItem(passedMenuItemObject) {
        this.navItemsArray.forEach(item => {
          item.isActive = (item == passedMenuItemObject)
        });
      }
    }
  });
  
  Vue.component('tab', {
    template: '#template-tab',
    props: {
      name: { required: true },
      selected: { default: false }
    },
    data() {
      return {
        isActive: false
      }
    },
    mounted() {
      this.isActive = this.selected;
    }
  });
  
  new Vue({
    el: '#application'
  });