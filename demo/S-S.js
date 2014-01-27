(function(){

	// CONFIGURATION
	window.SS_PROXY_SERVER = window.PROXY_SERVER || "http://jsonp.jit.su/?url=";
	window.SS_SOCIAL_API = window.SOCIAL_API || {
		twitter: {
			template:
				"<div onclick='window.open(\"https://twitter.com/share?url={{link}}&text={{text}}\",\"_blank\")'>"+
				"	<div id='ss_label'>{{label}}</div>"+
				"	<div id='ss_count'>{{count}}</div>"+
				"</div>",
			label: "Share on Twitter",
			requestURI: "http://urls.api.twitter.com/1/urls/count.json?url=",
			requestProperty: "count"
		},	
		facebook: {
			template:
				"<div onclick='window.open(\"https://www.facebook.com/sharer/sharer.php?u={{link}}&t={{text}}\",\"_blank\")'>"+
				"	<div id='ss_label'>{{label}}</div>"+
				"	<div id='ss_count'>{{count}}</div>"+
				"</div>",
			label: "Share on Facebook",
			requestURI: "http://graph.facebook.com/?id=",
			requestProperty: "shares"
		}
	};

	// When the page is done loading
	window.addEventListener("load",function(){
		// Convert all S-S divs to share buttons
		var shareButtons = document.querySelectorAll(".s-s");
		for(var i=0;i<shareButtons.length;i++){
			convertToButton(shareButtons[i]);
		}
	},false);

	// Convert a placeholder S-S div to a share button
	var convertToButton = function(dom){

		// Get Social API config
		var type = dom.getAttribute("data-type");
		var apiConfig = SS_SOCIAL_API[type];
		if(!apiConfig) return;

		// Create configuration
		var link = dom.getAttribute("data-href") || window.location.href;
		var text = dom.getAttribute("data-text") || document.head.getElementsByTagName("title")[0].innerHTML;
		var label = dom.getAttribute("data-label");
		var template = dom.getAttribute("data-template");
		var config = {
			link: encodeURIComponent(link),
			text: encodeURIComponent(text),
			label: label || apiConfig.label,
			template: template || apiConfig.template,
			requestURI: apiConfig.requestURI,
			requestProperty: apiConfig.requestProperty,
		};

		// Generate button HTML and insert
		getShareCount(config.requestURI+config.link, config.requestProperty, function(count){
			config.count = count;
			dom.innerHTML = generateHTML(config.template,config);
		});

	};

	// Get share count: Make API request, get property of JSON response, pass to callback.
	var getShareCount = function(request,property,callback){
		var xhr = new XMLHttpRequest();
		xhr.open("GET",SS_PROXY_SERVER+request);
		xhr.onreadystatechange = function() {
			if(xhr.readyState===4 && xhr.status===200){
				var response = JSON.parse(xhr.responseText);
				var count = response[property] || 0;
				if(count>10000){
					count = Math.round(count/1000)+"K";
				}else if(count>1000){
					count = ((Math.round(count/100)*100)/1000)+"K";
				}
				callback(count);
			}
		};
		xhr.send();
	};

	// Lightweight templating
	var generateHTML = function(template,config){
		var html = template;
		for(var name in config){
			var value = config[name];
			html = html.replace("{{"+name+"}}",value,"g");
		}
		return html;
	};

})();