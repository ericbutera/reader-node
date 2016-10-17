(function($){

  var socket = new io.Socket();
  socket.connect();
  socket.on('connect', function(){ console.log("connect"); }) 
  socket.on('message', function(data){ console.log("message %s", data); }) 
  socket.on('disconnect', function(){ console.log("disconnect"); }) 

  // provides article browsing 
  function registerAccordion() {
    $("#accordion").accordion({
      active: false,
      autoHeight: false
    });
  }

  function getSubArea() {
    return $("#subarea");
  }

  function toggleEditForm(ev) {
    ev.preventDefault();
    getSubArea().find("#edit").show();

    // register edit form handler
    $("#edit form").submit(function(ev){
      // ev.preventDefault();
      console.log("edit form submitted!");
    });
  }

  function registerSubscriptions() {
    function handleClick(subId) {
      Step(
        function load() {
          $.get("/subscription/header/" + subId, this);
        },
        function render(data) {
          var subEl = getSubArea();
          subEl.html(data);
          subEl.find("#edit").hide();
          subEl.find(".edit-button").click(toggleEditForm);
        }
      );
    }
    $("#subscriptions a").click(function(ev){
      ev.preventDefault();
      handleClick($(this).attr("rel"));
      console.log("clicked sub: %o", this);
      // fetch subscription
      // fetch entries
      // plot data into accordion
      // enact accordion on new html
    });
  }

  // register on ready actions
  $(document).ready(function() {
    registerSubscriptions();
    registerAccordion();
  });

})(jQuery);

