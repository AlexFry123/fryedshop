import './scss/main.scss';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

console.log('Hello!');
console.log(`The time is ${new Date()}`);

const myToken = "MUqFTun3MWFTizmnZ4pW";
var productsLength = 0;

$(document).ready(function(){
    $.get("https://nit.tron.net.ua/api/product/list", function(json){
    	json.forEach(product => $('.product-grid').append(createItem(product)));
    });
    $.get("https://nit.tron.net.ua/api/category/list", function(json){
    	json.forEach(category => $('.categoryList').append(createCategory(category)));
    });
    $(".menuBtn").on("click", () => {
		if($(".categoryList").is(":hidden")){
 			$(".categoryList").show();
		} else {
			$(".categoryList").hide();
		}
	});
	$('.cart').click(function(){
		if($("#gridOfProds").is(":visible")){
 			$("#gridOfProds").hide();
 			$('.cartView').show();
		}
		if($('#prodTemplate').is(":visible")){
			$("#prodTemplate").hide();
			$("#olPr").text("");
			$("#spPr").text("");
			$("#curPr").text("");
			$('.cartView').show();
		}
		let $tableBd = $(`<tbody id="tableBdy">`);
		if($('.cartView').is(":visible")){
			$('#tableBdy').remove();
		}
		$('.cartBack').click(function(){
			$('#tableBdy').remove();
			$('.cartView').hide();
			$("#gridOfProds").show();
		});
		$('#cartGrid').append($tableBd);
		let $headTbl = $(`<tr class="headOfTable">`);
		$tableBd.append($headTbl);
		$headTbl.append($(`<th style="width:100%; text-align: center;">`).text("Товар"));
		$headTbl.append($(`<th style="border-left: 1px solid white; border-right: 1px solid white;">`).text("Ціна"));
		$headTbl.append($(`<th style="border-left: 1px solid white; border-right: 1px solid white;">`).text("Кількість"));
		$headTbl.append($(`<th style="border-left: 1px solid white;">`).text("Видалити"));
		for(let tmpcou = 1; tmpcou <= productsLength; tmpcou++){
			if(localStorage.getItem(tmpcou)!=null){
			let temporaryParsedObj = JSON.parse(localStorage.getItem(tmpcou));
			let $tmptr = $(`<tr data-cart-item="0" style="background-color: rgba(75, 0, 130,0.1); border-bottom: 1px solid white;">`);
			$tmptr.attr('data-cart-item', tmpcou);
			$tableBd.append($tmptr);
			$tmptr.append($(`<td style="width:100%; text-align:center;">`).text(temporaryParsedObj.nameObj));
			$tmptr.append($(`<td style="border-left: 1px solid white; border-right: 1px solid white;">`).text(temporaryParsedObj.priceObj));
			$tmptr.append($(`<td style="border-left: 1px solid white; border-right: 1px solid white;">`).append($(`<input type="number" style="width: 80px; text-align: center;">`).attr("value",temporaryParsedObj.quantityObj)));
			let $deleteButn = $(`<button style="width: 80px; text-align: center;">`);
			$tmptr.append($(`<td style="border-left: 1px solid white;">`).append(($deleteButn).text("Видалити")));
			$deleteButn.click(function(){
				localStorage.removeItem(tmpcou);
				$("[data-cart-item = " + tmpcou + "]").remove();
			});
			}
		}
		if($('.noProducts').is(":visible")){
			$('.noProducts').remove();
		}
		if(localStorage.length == 0){
			$('#cartBlock').append($(`<p class = "noProducts">`).text("Кошик пустий"));
		} else {
			$('.noProducts').remove();
		}
	});
	$('#sendPostBtn').click(function(){
		let customerName = $('#fullName').val();
		let customerPhone = $('#phone').val();
		let customerEmail = $('#email').val();
		let postDataObj = {
			token: myToken,
			name: customerName,
			phone: customerPhone,
			email: customerEmail
		};
		for(let tempI = 1; tempI < productsLength; tempI++){
			if(localStorage.getItem(tempI)!=null){
				let tmpProdI = "products[" + tempI + "]";
				postDataObj[tmpProdI] = JSON.parse(localStorage.getItem(tempI)).quantityObj;
			}
		}
		console.log(JSON.stringify(postDataObj));
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(!re.test(String(postDataObj.email).toLowerCase())){
			alert("Невірно введено e-mail");
			return;
		}
		if(postDataObj.phone<100000000 || postDataObj.phone > 999999999){
			alert("Невірно введено номер телефону");
			return;
		}
		if(postDataObj.name.length == 0) {
			alert("Ім'я невірно введено");
			return;
		}
		if(localStorage.length == 0) {
			alert("Кошик пустий!");
			return;
		}
		$.post("https://nit.tron.net.ua/api/order/add", postDataObj)
			.done(function(){
				alert("Post request done!");
				localStorage.clear();
				window.setTimeout(function(){location.reload()},500)
			})
			.fail(function(data){
				alert("This data wasn't sent");
				console.log(data);
			})
	});
});

let createItem = ({
	id,
	name,
	image_url,
	description,
	price,
	special_price,
}) => {
	if($("#prodTemplate").is(":visible")){
		$("#prodTemplate").hide();
		$("#olPr").text("");
		$("#spPr").text("");
		$("#curPr").text("");
	}
	productsLength++;
	var $product = $(`<div class="card col-xl-4 col-md-6 col-xs-12">`);
	var $productContainer = $(`<div class="partOfProductCard" data-product-id="${id}">`);
	$productContainer.append($(`<img src="${image_url}" alt="${name}" class="img-fluid product-image">`));
	$productContainer.append($(`<span class="product-title">`).text(name));
	let $pricesV = $(`<div class="pricesDiv">`);
	let tempObj;
	let keyCounterForCartProducts = Number(1);
	if(special_price != null){
		$pricesV.append($(`<span class="oldPrice">`).text(price + " грн."));
		$pricesV.append($(`<span class="specPrice">`).text(special_price  + " грн."));
		tempObj = {
			nameObj: name,
			priceObj: special_price,
			quantityObj: keyCounterForCartProducts
		};
	} else {
		$pricesV.append($(`<span class="currPrice">`).text(price  + " грн."));
		tempObj = {
			nameObj: name,
			priceObj: price,
			quantityObj: keyCounterForCartProducts
		};
	}
	$productContainer.append($pricesV);
	$product.append($productContainer);
	var $cartAddButton = $(`<button class="btn">`).text("У кошик");
	$product.append($cartAddButton);
	$cartAddButton.click(function(){
		let serializedObj;
		if(localStorage.getItem(id)!=null){
			let parsedObj = JSON.parse(localStorage.getItem(id));
			parsedObj.quantityObj = parsedObj.quantityObj + 1;
			serializedObj = JSON.stringify(parsedObj);
			localStorage.setItem(id, serializedObj)
		} else {
			serializedObj = JSON.stringify(tempObj);
			localStorage.setItem(id, serializedObj);
		}
		alert("Товар додано до кошику");
	});
	$productContainer.click(function(){
		document.getElementById("gridOfProds").style.display = "none";
		document.querySelector("#prodTemplate").style.display = "block";
		let $backButton = $("#backBtn");
		$backButton.click(function(){
			document.querySelector("#prodTemplate").style.display = "none";
			document.getElementById("gridOfProds").style.display = "";
			$("#olPr").text("");
			$("#spPr").text("");
			$("#curPr").text("");
		});
		$('#specialButton').click(function(){
		let serializedObj;
		if(localStorage.getItem(id)!=null){
			let parsedObj = JSON.parse(localStorage.getItem(id));
			parsedObj.quantityObj = parsedObj.quantityObj + 1;
			serializedObj = JSON.stringify(parsedObj);
			localStorage.setItem(id, serializedObj)
		} else {
			serializedObj = JSON.stringify(tempObj);
			localStorage.setItem(id, serializedObj);
		}
		alert("Товар додано до кошику");
	});
		$("#imgTempl").attr("src", image_url);
		$("#imgTempl").attr("alt", name);
		$("#pTitl").text(name);
	if(special_price != null){
		$("#olPr").text(price + " грн.");
		$("#spPr").text(special_price  + " грн.");
	} else {
		$("#curPr").text(price  + " грн.");
	}
		$("#descr").text(description);
	});
	return $product;
};

let createCategory = ({
	id,
	name,
	description,
}) => {
	var $category = $(`<li class="categoryItem" data-category-id="${id}">`);
	$category.append($(`<span class="categoryText">`).text(name));
	$category.click(function(){
		$.get("https://nit.tron.net.ua/api/product/list/category/" + id , function(json){
			$('.product-grid').remove();
			if($('.cartView').is(":visible")){
			$('.cartView').hide();
			}
			$('#content').append($(`<div class="row product-grid" id="gridOfProds">`));
			json.forEach(categoryGrid => $('.product-grid').append(createItem(categoryGrid)));
		});
	});
	return $category;
};