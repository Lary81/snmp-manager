
$(function(){
	Highcharts.setOptions({
	    global: {
	        useUTC: false
	    }
	});

	updateUptime();
	updateDescription();
	updateProcessCount();
	
});

function clickedButton(btn) {

	var oid = $('#oid_field').val();

	if (btn==1) {
		$.getJSON("/snmp/get/"+oid, function(result){
			var oldText = $('#text_area').val();
			var newText = 'GET '+oid+': '+result+'\n';
			$('#text_area').html(oldText + newText.replace('\\n', '<br/>'));
		});
	}
	else if (btn==2) {
		$.getJSON("/snmp/walk/"+oid, function(result){
			var oldText = $('#text_area').val();
			var newText = 'WALK '+oid+': '+result+'\n';
			$('#text_area').html(oldText + newText.replace('\\n', '<br/>'));
		});
	}
	else if (btn==3) {
		$('#text_area').html('');
	}
	
}

function updateUptime(){
	$.getJSON("/history/uptime", function(uptime){
		$("#uptimeInfo").html(uptime.seconds);
		setTimeout(updateUptime, 5000);
	});
}

function updateDescription(){
	$.getJSON("/history/systemDescription", function(systemDescription){
		$("#systemDescriptionInfo").html(systemDescription.description);
		setTimeout(updateDescription, 5000);
	});
}


var processChartSeries;
function configureProcessCountChart(processesData){
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'spline',
            events: {
                load: function() {
                    processChartSeries = this.series[0];
                }
            }
        },
        title: {
            text: 'Processes History'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Counter'
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Processes',
            data: (function() {
                var data = [];

                for (var i = 0; i < processesData.length; i++) {
                	console.log(new Date(processesData[i].date));
                    data.push({
                        x: processesData[i].date,
                        y: processesData[i].numberOfProcesses
                    });
                }
                return data;
            })()
        }]
    });
}


function updateProcessCount(){	
	if(processChartSeries){
		$.getJSON("/history/processes/last", function(pData){
			var x = pData.date,
				y = pData.numberOfProcesses;
        	console.log(new Date(pData.date));
			processChartSeries.addPoint([x, y], true, true);
			setTimeout(updateProcessCount, 5000);
		});
	}else{
		$.getJSON("/history/processes", function(processesInfo){
			configureProcessCountChart(processesInfo);
			setTimeout(updateProcessCount, 5000);
		});
	}
}

