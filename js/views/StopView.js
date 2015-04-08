var Backbone = require('backbone'),
		_ = require('underscore'),
		$ = require('jquery');
		StopTemplate = require('./templates/Stop.tpl.html'),
		ContentView = require('./../utilities/contentView'),
		ArrivalList = require('./../collections/ArrivalList'),
		ArrivalView = require('./../views/ArrivalView'),
		Intervals = require('./../utilities/intervalService'),
		contentView = new ContentView();

module.exports = Backbone.View.extend({
		template: StopTemplate,

		initialize: function() {
			this.collection = new ArrivalList;
			this.collection.stopId = this.model.get('stopId');
			this.collection.on('add', this.addArrival, this);
			this.collection.on('sort', this.checkOrder, this);
			this.collection.on('sync', this.checkForEmpty, this);
			this.listenTo(contentView, 'forceRefresh', this.updateArrivalList);

			this.updateArrivalList();
			Intervals.push(setInterval($.proxy(this.updateArrivalList, this), 60000));
		},

		updateArrivalList: function() {
			this.collection.fetch({dataType: 'jsonp'});
		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		checkForEmpty: function() {
			if(!this.collection.length) {
                var noStopsDiv = $('<div/>', {text: 'No scheduled stops'});
                noStopsDiv.addClass('no-arrivals');
                this.$('.arrivals').html(noStopsDiv);
			}
		},

		checkOrder: function() {
		    var dom = this.$('.arrivals .table .schedule');
		    if(dom.length != this.collection.length) {
		        this.addAllArrivals();
		        return;
		    }

		    for(var i=0; i<this.collection.length; i++) {
		        if($(dom[i]).attr('data-id') != this.collection.at(i).id) {
		            this.addAllArrivals();
    		        return;
		        }
		    }
		},

		addAllArrivals: function() {
		    this.$('.arrivals .table').empty();
		    this.collection.each(this.addArrival, this);
		},

		addArrival: function(arrival) {
			var arrivalView = new ArrivalView({model: arrival, stop: this.model});
			this.$('.arrivals .table').append(arrivalView.render().$el);
		}
	});
