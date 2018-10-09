// 获取dom元素
var boxSup=document.querySelector('div.box .inner-sup');
var locationTime=document.querySelector('div.box .inner-sup .location .location-time');
var locationData=document.querySelector('div.box .inner-sub .weather.today .left-sub');
var proCity=document.querySelector('div.box .inner-sup .city');
var locationCity=document.querySelector('div.box .inner-sup .location .loaction-city');
var todayTemp=document.querySelector('div.box .inner-sub .weather.today .left');
var todayWeather=document.querySelector('div.box .inner-sub .weather.today .right .right-sub');
var futureWeek=document.querySelectorAll('div.box .inner-sub .weather.future .future-top');
var futuerWeather=document.querySelectorAll('div.box .inner-sub .weather.future .future-sub');
var loading=document.querySelector('div.box .inner-sup .location .map');
var notice=document.querySelector('div.box .inner-sup .refeash');
var search=document.querySelector('div.box .inner-sup .search');
var searchIco=document.querySelector('div.box .inner-sup .search-ico');
//添加日期和时间
getTime();
var timer=setInterval(getTime,1000);

function getTime(){
	var arr=['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
	var date=new Date();
	var month=date.getMonth();
	var week=date.getDay();
	var day=date.getDate();
	var hours=date.getHours();
	var min=date.getMinutes();
	month=add(month+1);
	week=arr[week];
	day=add(day);
	min=add(min);

	//根据时间切换背景
	if(hours>6&&hours<12){
		boxSup.style.backgroundImage='url(img/3.jpg)';
	}else if(hours>12&&hours<19){
		boxSup.style.backgroundImage='url(img/1.jpg)';
	}else{
		// boxSup.style.backgroundImage='url(https://api.dujin.org/bing/1366.php)';
		boxSup.style.backgroundImage='url(img/5.jpg)';
	}
	if(hours>12){
		hours=add(hours-12);
		locationTime.innerHTML=hours+':'+min+' PM';
	}else{
		hours=add(hours);
		locationTime.innerHTML=hours+':'+min+' AM';
	}
	locationData.innerHTML=week+' '+month+'月'+day+'日';
}

function add(time){
	if(time<10){
		return '0'+time;
	}else{
		return ''+time;
	}
}


//载入天气
showCityInfo();

//刷新定位
loading.onclick=function(){
	showCityInfo();
	notice.innerHTML="当前城市&nbsp;&nbsp;&nbsp;<p class='fa fa-street-view'></p>";
};

//搜索城市天气
search.onkeyup=function(e){
	var e=e||event;

	if(e.keyCode==13){
		var searchCity=search.value;
		var searchCityId=getCityId(searchCity);
		if(searchCityId!='error'){
			getWeather(searchCityId);
			locationCity.innerHTML=searchCity;
			notice.innerHTML="查询城市&nbsp;&nbsp;&nbsp;<p class='fa fa-send'></p>";
			search.value='';
		}else{
			search.value='请确认城市名是否正确！';
			search.style.background='rgba(225,0,0,0.5)';
			search.style.color='white';
		}
		
	}
};

search.onfocus=function(){
	searchIco.className='search-ico';	
	search.placeholder='  请输入市、县级城市名回车查询';
	move(search,{'width':300},function(){
		move(searchIco,{'opacity':0});
	});
};

search.onblur=function(){
	search.placeholder='';
	searchIco.className='search-ico fa fa-search';	
	move(searchIco,{'opacity':80});
	move(search,{'width':120},function(){
		search.placeholder='     点此查询天气';
	});
	if(search.value=='请确认城市名是否正确！'){
		search.value='';
		search.style.background='rgba(225,225,225,0.5)';
		search.style.color='black';
	}
};

search.onkeydown=function(e){
	var e=e||event;
	if(e.keyCode==8){
		if(search.value=='请确认城市名是否正确！'){
			search.value='';
			search.style.background='rgba(225,225,225,0.5)';
			search.style.color='black';
		}
	}
}
//获取天气情况
// 在线代理解决跨域问题。http://crossorigin.me/
function getWeather(cityid){
	ajax({
		"type":"GET",
		"url":"http://crossorigin.me/http://aider.meizu.com/app/weather/listWeather?cityIds=",
		// "data":cityid+'&'+new Date().getTime(),
		"data":cityid+'&'+new Date().getTime(),
		"asyn":true,
		"funSucc":function(str){
			var localWeather=JSON.parse(str);
			loadSucc(localWeather);
		},
		"funFail":function(error){
			loadError(error);
		}
	});
}


//请求数据时
function loadBefore(){
	loading.className='map fa fa-refresh fa-spin';
	locationCity.innerHTML='定位中';
	locationCity.style.color='white';
	proCity.innerHTML='天气查询中，请稍后';
	proCity.style.color='white';
	move(notice,{'right':-155,'opacity':0});
}

//获取数据成功时
function loadSucc(apiData){
	loading.className='map fa fa-map-marker';
	//所在省份
	var provinceName=apiData.value[0].provinceName;
	provinceName=provinceName.replace('省','');
	proCity.innerHTML=provinceName+' · 中国';
	move(notice,{'right':0,'opacity':100});

	//今天体感温度
	todayTemp.innerHTML=apiData.value[0].realtime.sendibleTemp+'°';
	//今天实时天气
	todayWeather.innerHTML=apiData.value[0].realtime.weather;

	//未来天气
	for(var i=1;i<7;i++){
		//星期
		futureWeek[i-1].innerHTML=apiData.value[0].weathers[i].week;
		//天气
		futuerWeather[i-1].innerHTML=apiData.value[0].weathers[i].weather+apiData.value[0].weathers[i].temp_day_c+'°'; 
	}
}

//获取数据失败时
function loadError(error){
	proCity.innerHTML=' Σ(°△°|||)服务器开了小差 Error:'+error;
	proCity.style.color='red';
	loading.className='map fa fa-ban';
	locationCity.innerHTML='请重试';
	locationCity.style.color='red';
}



//ajax函数
function ajax(json){
	loadBefore();
	var xhr=null;
	if(window.XMLHttpRequest){
		xhr=new XMLHttpRequest();
	}else{
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}

	if(json.type=='GET' && json.data){
		
		xhr.open(json.type,json.url+json.data,json.asyn);
		xhr.send();
	}else{
		xhr.open(json.type,json.url,json.asyn);
		
		if(json.type=='POST'){
			xhr.setRequestHeader('content-type','x-www.form-urlencode');
			xhr.send(json.data);
		}else{
			xhr.send();
		}
	}
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			if(xhr.status==200){
				// loading.className='map fa fa-map-marker';
				json.funSucc(xhr.responseText);
			}else{
				if(json.funFail){
					// loading.className='map fa fa-ban';
					// locationCity.innerHTML='请重试';
					json.funFail(xhr.status);
				}
			}
		}
	};
}


//调用高德API获取定位
var map = new AMap.Map("container", {
        resizeEnable: true,
        center: [116.397428, 39.90923],
        zoom: 13
    });
    //获取用户所在城市信息
    function showCityInfo() {
        //实例化城市查询类
        var citysearch = new AMap.CitySearch();
        //自动获取用户IP，返回当前城市
    	citysearch.getLocalCity(function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                if (result && result.city && result.bounds) {
                    var cityinfo = result.city;
					if(cityinfo!=='吴县'){
						var re=/省|市|州|县|乡|镇/g;
						cityinfo=cityinfo.replace(re,'');	
					}
					//进入页面时自动加载天气
                	getWeather(getCityId(cityinfo));
                	
					locationCity.innerHTML=cityinfo;
                }
            } else {
                proCity.innerHTML=result.info;
            }
        });
    }

//获取城市id
function getCityId(cityname){
	var cityid='';
	for(var i=0;i<bigcity.length;i++){
		if(bigcity[i].city==cityname){
			cityid=bigcity[i].cityid;
			break;
		}
	}
	if(cityid){
		return cityid;	
	}else{
		return 'error';
	}
}


function getAttr(ele,attr){
	if(ele.currentStyle){
		return ele.currentStyle[attr];
	}else{
		return getComputedStyle(ele,false)[attr];
	}
}
function move(ele,json,fun){
	clearInterval(ele.timer);
	ele.timer=setInterval(function(){
		var stop=true;
		for(var attr in json){
			var cur;
			if(attr=='opacity'){
				cur=Math.round(parseFloat(getAttr(ele,attr))*100);
			}else{
				cur=parseInt(getAttr(ele,attr));
			}
			var iTarget=json[attr];

			var speed=(iTarget-cur)/4;
			speed=speed>0?Math.ceil(speed):Math.floor(speed);

			if(cur!=iTarget){
				stop=false;
			}

			if(attr=='opacity'){
				cur+=speed;
				ele.style.opacity=cur/100;
				ele.style.filter='alpha(opacity:'+cur+')';
			}else{
				ele.style[attr]=cur+speed+'px';
			}
		}
		if(stop){
			clearInterval(ele.timer);
			if(fun){fun()};
		}
	},30);
}
/*
JSON数据分析：
localWeather.value[0]               //获取天气信息

//位置信息
localWeather.value[0].city          //城市名称
localWeather.value[0].cityid        //城市id
localWeather.value[0].provinceName  //该城市所在省份

//预警信息【6个项目指数】
localWeather.value[0].indexes				//预警信息
localWeather.value[0].indexes[i].name		//项目指数名称
localWeather.value[0].indexes[i].level		//项目指数
localWeather.value[0].indexes[i].content	//建议信息

//空气质量
localWeather.value[0].pm25         			//pm2.5建议
localWeather.value[0].pm25.aqi     			//空气指数
localWeather.value[0].pm25.quality 			//空气质量
localWeather.value[0].pm25.upDateTime		//更新时间

//realtime实时天气情况(猜测)
localWeather.value[0].realtime.sD   		//空气湿度百分比
localWeather.value[0].realtime.sendibleTemp //体感温度
localWeather.value[0].realtime.ziwaixian    //紫外线(N/A无可用信息)
localWeather.value[0].realtime.wD   		//风向
localWeather.value[0].realtime.wS   		//风力
localWeather.value[0].realtime.weather 		//天气情况
localWeather.value[0].realtime.time 		//更新时间

//天气情况细节
	//更新时间
		localWeather.value[0].weatherDetailsInfo.publishTime

	//未来天气情况细节（以三个小时为单位）数组0-6
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos

	//时间段
		//时间间隔结束点
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].endTime
		//时间间隔起始点
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].startTime

	//天气情况
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].weather

	//温度
		//最高温度
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].highestTemperature
		//最低温度
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].lowerestTemperature

	//降雨情况
		//是否下雨
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].isRainFall
		//降雨量
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].precipitation

	//风力风向
		//风向
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].wd
		//风力大小
		localWeather.value[0].weatherDetailsInfo.weather3HoursDetailsInfos[i].ws
	
//未来一星期天气情况
localWeather.value[0].weathers                  //数组
localWeather.value[0].weathers[i].data          //日期
localWeather.value[0].weathers[i].week          //星期几
localWeather.value[0].weathers[i].temp_day_c    //白天气温，摄氏度为单位
localWeather.value[0].weathers[i].temp_night_c  //夜间气温，摄氏度为单位
localWeather.value[0].weathers[i].temp_day_f    //白天气温，华氏度为单位
localWeather.value[0].weathers[i].temp_night_f  //夜间气温，华氏度为单位
localWeather.value[0].weathers[i].weather       //天气情况
localWeather.value[0].weathers[i].wd            //风向
localWeather.value[0].weathers[i].ws            //风力大小
localWeather.value[0].weathers[i].sun_rise_time //日出时间
localWeather.value[0].weathers[i].sun_down_time //日落时间
*/