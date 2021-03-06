/***************************************************
**  Control.js 
**  Main functions for finding flaws in SWF Files
**  
**  Author: Stefano Di Paola (stefano.dipaola@mindedsecurity.com)
**  Copyright: Minded Security � 2007
**  License: GPL 2.0
**
****************************************************/

// Arrays for informations storing
var _rootVars=new Array();
var _globalVars=new Array('_url');
var _level0Vars=new Array();
var VariablesVars=new Array();

// Arrays for Xss informations
var Xssed=new Array();
var _undefVars=new Array();
var _selectedAttackPatterns= new Array();
var globalEl='';
var clearit=null;
var i=0;
var elem=0;
var orisrc='';



/******************************************
** void gotRoot(Parameter_name)
** called if Xss test is accomplished
** Adds the affected parameter name to
** Xssed array
** Return Value: void
*/
function gotRoot(name){
 if(!inarray(name,Xssed)){
   Xssed.push(name);
   var elNum = (name.substr(name.indexOf(' '),name.length));
   var par = (name.substr(0,name.indexOf(' ')));
   if(par.indexOf("!")>=0)
     par=par.substr( par.indexOf('!')+1,par.length);
     
   if(alertWhenFound)
    alert('gotcha! '+name);
 
   writeTo("Xss","<b> " +"<a href='"+$("swfurl").value+"?"+par+"="+_selectedAttackPatterns[elNum*1].replace("gotRoot","alert").replace("|NAME|","test").replace(/'/g,'&#39;')+"&"+_customValuedParameters+"' target='_blank'><span title='"+_selectedAttackPatterns[elNum*1].replace(/'/g,"&#39;")+"'>" + escapeHtml(name)+"</span>"+"</b></a> <br>");
 }
}

onerror=function(e){
   writeTo("Errors","<b> " +e+"</b> <br>");
}

/******************************************
** void writeSWF(SwfUrl)
** Facility Function which loads an SWF to
** an embed element.
** 
** Return Value: void
*/
function writeSWF(url,where){
 writeDebug(escapeHtml(unescape(url))+"<br>")
 var so = new SWFObject(url, "getVars", "400", "400", "9", "#eeeeee");
 url=$("swfurl").value;
 so.addParam("base", url);
 so.addParam("wmode", "transparent");
 if(where==undefined)
   where="flashcontent"
    so.write(where);
}

var countAttacks=1;

/////////////////////
// 
//
//
//
function checkXss(){

 if(_undefVars[i]==undefined){return false;}
 
 setTimeout(function(){setProgressBar(((countAttacks++)*100/(_selectedAttackPatterns.length*_undefVars.length)).toFixed(1))},0);

 var attackString=(_selectedAttackPatterns[elem].replace('|NAME|',_undefVars[i]+' '+elem));
 writeSWF(orisrc+'&'+ _undefVars[i]+'='+escape(attackString))+(_customValuedParameters!=''?"&"+_customValuedParameters:'');

 if(miniSwf) {
   url=(swfurl+'?'+ _undefVars[i]+'='+escape(attackString))+(_customValuedParameters!=''?"&"+_customValuedParameters:'');
   var so = new SWFObject(url, "getVars2", "30", "30", "9", "#ffffff");
   so.addParam("base", url.substr(0,url.indexOf('?')));
   where="flashcontent2"
   so.write(where);
 }
 elem++;
 if(_selectedAttackPatterns[elem]==undefined){
  elem=0
  i++;
 }

}

/******************************************
** void writeSWF(SwfUrl)
** Facility Function which loads an SWF to
** an embed element.
** 
** Return Value: void
*/
function goXss(){
 i=0;
 elem=0;
 
 _selectedAttackPatterns=new Array();
  _undefVars=new Array();
 selObj=document.getElementById('_global');
 countAttacks=1;
//     mystr=''
//     for(var j=0;j<selObj.options.length;j++)
//        mystr+=' '+selObj.options[j].value
//     alert(_globalVars.toString()+' '+mystr);
 while(i< _globalVars.length){
  if(selObj.options[i].selected)
 //  _undefVars.push(  selObj.options[i].value.substr(_globalVars[i].indexOf('.')+1));
   _undefVars.push( _globalVars[i].substr(_globalVars[i].indexOf('.')+1));
   i++;
 }

 if(_undefVars.length==0){
   alert("Error, no Parameter selected!");
   return ;
 }
 
 // Load standard attack Array (only selected element)
 for(var e=0;e<_attackPatternsChecked.length;e++)
  if(_attackPatternsChecked[e])
   _selectedAttackPatterns.push(attackVector[e]);
  
 // Load custom attack Array (only selected element)
 for(var e=0;e<_customAttackPatternsChecked.length;e++)
  if( _customAttackPatternsChecked[e])
   _selectedAttackPatterns.push(_customAttackPatterns[e]);

 if(_selectedAttackPatterns.length==0){
   alert("Error, no Attack selected!");
   return ;
 }
 
 setProgressBar(0);
 swfurl=$("swfurl").value;
 i=0;

 // first one is directly
 // called so we dont have to wait for n seconds
 checkXss();
 
 // We call checkXss every n seconds
 clearit= setInterval(checkXss,seconds);
}



/*******
** String escapeHtml(string) 
** escapes < and > for printing string
** 
*/
function escapeHtml(str){
 return str.replace(/>/g,'&gt;').replace(/</g,"&lt;");
}

function parseXml(XMLValue){ 
      var objDOMParser = new DOMParser();
        var xml = objDOMParser.parseFromString(XMLValue.replace(/&/g,"&amp;"), "text/xml");
        xml.async = false;
       
        xsl = document.implementation.createDocument("","",null);    
        try
        {
            xsl.async=false;
            xsl.load('xml/tree.xsl');
        }
        catch(e)
        {
            alert(e.message);
        } 
        var oProcessor = new XSLTProcessor()
        oProcessor.importStylesheet(xsl);

        var oResultDom = oProcessor.transformToDocument(xml);
        var serializer = new XMLSerializer();
        return serializer.serializeToString(oResultDom); 
	
	
	 
}
var countObject=0;
/*******
**   getObject(element) 
** calls Flash checkFlashObject method and gets the snapshot of an object
** 
*/
 function getObject(el,str){
 if(str==''){
  return ;
 }
 pre='<?xml version="1.0" encoding="windows-1250" ?>';//+'<?xml-stylesheet type="text/xsl" href="js/oat/xslt/tree.xsl"?>'
 
 str=str?str:el.textContent.toString();
   var FlashObject= document.getVars.checkFlashObject(str,true);
 
 if(typeof FlashObject=="undefined" ||typeof FlashObject=="null"  )
  FlashObject='<'+typeof FlashObject+'></'+typeof FlashObject+'>'; 
 
 html=( parseXml(  pre+FlashObject ))//FlashObject;
 countObject++;
  reWriteTo("Infos",'<div id="'+str+'" style="font-weight:bold;color: #004400;margin-bottom: 2px;border-bottom: solid 1px;">'+str+'</div><div style="float: right;">Search value <input type="text" onkeyup="if(event.keyCode==13){expandToItem(\x27tree\x27,this.value);};" style="border: solid 1px"></div><br><b>'+(html)+"</b>");
  var f=$( str);
  f.scrollIntoView();
  convertTrees();
  expandTree('tree');
}


/*******
** getVars_DoFSCommand(command, args) 
** called by getVars.swf when parameters are undefined
** 
*/
function getVars_DoFSCommand(command, args) {

 try{
  var array= eval(command+"Vars")
 
 if(!inarray(args,array))
 {

  array.push(args);
 if(command!='_global')
  writeTo(command,"<b> <span class='explore' onclick='getObject(this);'>"+ escapeHtml(args)+"</span></b> <br>");
  else
   addVar('_global',args);
 } 
 }catch(e){

     writeTo("Errors","<b> " +escapeHtml( command )+" "+escapeHtml(args)+" called</b> <br>"); 
 }
}

/************
   This function is due to a bug in firefox+flash
   Flash doesnt' recognize the full path to itself and misses 
   loading external files from the right directory
*/
function checkDomain(){
 var swfval = $("swfurl").value;
if(swfval.indexOf( location.protocol+'//'+location.host+'/')!=0)
 $("swfurl").value=location.protocol+'//'+location.host+'/'+swfval;
return true;
}



/****
Initialization stuff
*/
function init(){
 globalEl=$('Errors');
 initializeConfig();
 if(navigator.userAgent.indexOf("Firefox/2.")<0) {
    showOnlyFirefoxDiv();
 }
 if(showXssDiv){
  $("Xssdiv").style.display="block";
  setWidth("snapshot","382px");
 }else{
  $("Xssdiv").style.display="none";
  setWidth("snapshot","564px"); 
 }
 if(showDebugDiv) 
  $("debug").style.display="block";
  else 
  $("debug").style.display="none";
// showHelpDiv();
 var url=getQueryParamValue("swfurl");
 $("swfurl").value=((url!='')?unescape(url):location.protocol+'//'+location.host+'/');
 
 setItem("swfurl",$("swfurl").value);
 url=unescape(url);
 maxUrlLength =25;
 url2=url.substr(url.indexOf('/',7),url.length);
 urlhist=url2.substr(((url2.length-maxUrlLength)<0?0:(url2.length-maxUrlLength)),url2.length);
// alert( urlhist+' '+(url2.length-maxUrlLength) )
 if(url2.length> maxUrlLength)
  urlhist='... '+urlhist;
  addToHistory(urlhist,location.href);
 
}
