
    $('#wt-search').on('click',function(e) {
    	e.stopPropagation()
    	$(this).hide();
    	$('#search').css({
    		"opacity": 1,
    		"z-index": 1
    	});
    	$('.search-wrapper').addClass('active');
    });
    $('#input-search').on('click', function(e) {
        e.stopPropagation();
    });
    $(window).on('click', function(){
      $('#wt-search').show();
      $('#input-search').val('');
      $('#wt-all-list li').hide();
      $('#search').css({
    		"opacity": 0,
    		"z-index": -1
    	});
      $('.search-wrapper').removeClass('active');

    });
    $('#header-dd .follow').on('mouseenter',function(){
    	$('.follow-list').slideDown();
    });
    $('.follow-list').on('mouseleave',function(){
    	$('.follow-list').slideUp();
    });
    //输入框的监听
    var regExp = null;
    $('#input-search').keyup(function(){
    	$('#wt-all-list li').hide();
    	var str=$(this).val();
    	regExp=new RegExp(str,'i');
    	$('.search-title').each(function(){
    		if(str!=="" && regExp.test($(this).text()))
    		{
    			$(this).parent().show();
    		}
    	});
    });

	// 瀑布流
	var time;
	$(window).on('scroll',function()
	{
		if(time){
			clearTimeout(time);
		}
		time = setTimeout(function() {
			checkShouldShow();
		}, 50);
	});

	function checkShouldShow(){
	     if(isShouldShow($("#load")))
	     {
	     	loadAndPlace();
	     }
	}

	function isShouldShow($ele)
	{
		 var scrollHeigth = $(window).scrollTop();//获取滚动的距离
		 var winHeigth = $(window).height();//获取界面的高度
		 var top = $ele.offset().top;//获取图片最下方距离浏览器可视窗口顶部的距离
		 if(top < scrollHeigth + winHeigth){
		 	return true;
		 } else {
		  	return false;
		 }
	}
	/*
	* 获取数据和图片摆放的位置
	*/

	//请求本地数据
	var Data = [];
	var isEnd = false;
	var i = 0;
	var pageCount = 9; //设置每次显示的条目数
	function loadAndPlace(){
		if (isEnd)
			return;
		if(Data.length === 0) {
          $.getJSON("data/Data.json",function(result){
			    	if(result && result.Data.length) {
			    		Data = result.Data;
			    		console.log('data_lne'+Data.length);
			    		if(result.Data.length < pageCount){
			    			place(result.Data.slice(0, result.Data.length));
			    		} else {
			    			place(result.Data.slice(0, pageCount));
			    		}
			    		i = i + 1;
			    	} else{
			    		console.log('获取数据出错');
			    	}
		     });
    } else {
        var start = i*pageCount ;
        if(start > Data.length){
        	isEnd = true;
        	return;
        } else {
        	end = (start+8) > Data.length ?  Data.length : start + 8;
        }

        place(Data.slice(start,end));
        i ++;
      }

	}

	//数据填充文档中
function place(nodeList) {
		var $nodes = renderData(nodeList);
		//检测图片是否加载完成
		var defereds = [];
		$nodes.find('img').each(function() {
			var defer = $.Deferred(); //jquery 对象，用于事件状态的检测
			$(this).load(function(){
             defer.resolve(); //图片加载完毕，设置事件的状态为完成
			});
			defereds.push(defer);
		});
		//当所有图片加载完成后执行瀑布流，只有所有图片加载完成后才能执行，这样计算出来的高度才准确
		$.when.apply(null,defereds).done(function(){
            waterFallPlace($nodes);
		});
	}

	//构建节点,此时所有的图片都叠在同一个位置
	function renderData(items){
		var tpl = '';
		var list_str = '';
		var $nodes;
		var $node_list;
		for(var i = 0; i < items.length; i++){
			tpl += '<div class="item">';
			   tpl += '<a class="link" href="' + items[i].link + '" alt=" ">';
			   tpl += '<img src="' + items[i].img + '"/>';
			   tpl += "</a>";
			   tpl += '<p class="header">' + items[i].header+'</p>';
            tpl += '</div>';
            list_str += '<li>';
              list_str += '<a href="'+items[i].link + '" class="search-thumb">';
              list_str += '<img src="' + items[i].img+'"/>';
              list_str += "</a>";
              list_str += '<a href="'+items[i].link + '" class="search-title">' + items[i].header + '</a>';
              list_str += "</li>";
		}
		$nodes = $(tpl);
		$node_list = $(list_str);
		$('#main').append($nodes);
		$('#wt-all-list').append($node_list);
		return $nodes;
	}
    /*
     *计算列数
     *初始化每一列的高度
     */
     var colSumheight = [];
     var nodeWidth = $('.item').outerWidth(true);//包含item的width,margin,padding
     var colNum = parseInt($('#main').width()/nodeWidth);
     for(var j = 0; j< colNum; j++){
     	 colSumheight.push(0);
     }
	  //瀑布流函数
	 function waterFallPlace($nodes){
		 //遍历每一个item并选择合适的位置放置
         $nodes.each(function(){
             var $current = $(this);
             var index = 0;
             var minSumHeight = colSumheight[0];
             for(var i = 0; i < colSumheight.length; i++){
             	 if(minSumHeight > colSumheight[i]) {
             	 	 index = i;
             	 	 minSumHeight = colSumheight[i];  //找出高度最小的列
             	 }
             }
             $current.css({
             	left: nodeWidth * index,
             	top: minSumHeight,
             	opacity: 1
             });
             colSumheight[index] = $current.outerHeight(true) + colSumheight[index];//更新列高度数组
             $('#main').height(Math.max.apply(null,colSumheight));//更新容器高度
         });

}
$(function(){
    checkShouldShow();
});
