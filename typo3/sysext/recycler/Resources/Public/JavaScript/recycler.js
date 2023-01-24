/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import DocumentService from"@typo3/core/document-service.js";import $ from"jquery";import NProgress from"nprogress";import"@typo3/backend/input/clearable.js";import"@typo3/backend/element/icon-element.js";import DeferredAction from"@typo3/backend/action-button/deferred-action.js";import Modal from"@typo3/backend/modal.js";import Notification from"@typo3/backend/notification.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";import RegularEvent from"@typo3/core/event/regular-event.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";var RecyclerIdentifiers;!function(e){e.searchForm="#recycler-form",e.searchText="#recycler-form [name=search-text]",e.searchSubmitBtn="#recycler-form button[type=submit]",e.depthSelector="#recycler-form [name=depth]",e.tableSelector="#recycler-form [name=pages]",e.recyclerTable="#itemsInRecycler",e.paginator="#recycler-index nav",e.reloadAction="a[data-action=reload]",e.undo="a[data-action=undo]",e.delete="a[data-action=delete]",e.massUndo="button[data-multi-record-selection-action=massundo]",e.massDelete="button[data-multi-record-selection-action=massdelete]"}(RecyclerIdentifiers||(RecyclerIdentifiers={}));class Recycler{constructor(){this.elements={},this.paging={currentPage:1,totalPages:1,totalItems:0,itemsPerPage:TYPO3.settings.Recycler.pagingSize},this.markedRecordsForMassAction=[],this.handleCheckboxStateChanged=e=>{const t=$(e.target),a=t.parents("tr"),s=a.data("table")+":"+a.data("uid");if(t.prop("checked"))this.markedRecordsForMassAction.push(s);else{const e=this.markedRecordsForMassAction.indexOf(s);e>-1&&this.markedRecordsForMassAction.splice(e,1)}this.markedRecordsForMassAction.length>0?(this.elements.$massUndo.find("span.text").text(this.createMessage(TYPO3.lang["button.undoselected"],[this.markedRecordsForMassAction.length])),this.elements.$massDelete.find("span.text").text(this.createMessage(TYPO3.lang["button.deleteselected"],[this.markedRecordsForMassAction.length]))):this.resetMassActionButtons()},this.deleteRecord=e=>{if(TYPO3.settings.Recycler.deleteDisable)return;const t=$(e.target).parents("tr"),a="TBODY"!==t.parent().prop("tagName");let s,n;if(a)s=this.markedRecordsForMassAction,n=TYPO3.lang["modal.massdelete.text"];else{const e=t.data("uid"),a=t.data("table"),i=t.data("recordtitle");s=[a+":"+e],n="pages"===a?TYPO3.lang["modal.deletepage.text"]:TYPO3.lang["modal.deletecontent.text"],n=this.createMessage(n,[i,"["+s[0]+"]"])}Modal.advanced({title:TYPO3.lang["modal.delete.header"],content:n,severity:SeverityEnum.error,staticBackdrop:!0,buttons:[{text:TYPO3.lang["button.cancel"],btnClass:"btn-default",trigger:function(){Modal.dismiss()}},{text:TYPO3.lang["button.delete"],btnClass:"btn-danger",action:new DeferredAction((()=>{this.callAjaxAction("delete",s,a)}))}]})},this.undoRecord=e=>{const t=$(e.target).parents("tr"),a="TBODY"!==t.parent().prop("tagName");let s,n,i;if(a)s=this.markedRecordsForMassAction,n=TYPO3.lang["modal.massundo.text"],i=!0;else{const e=t.data("uid"),a=t.data("table"),r=t.data("recordtitle");s=[a+":"+e],i="pages"===a,n=i?TYPO3.lang["modal.undopage.text"]:TYPO3.lang["modal.undocontent.text"],n=this.createMessage(n,[r,"["+s[0]+"]"]),i&&t.data("parentDeleted")&&(n+=TYPO3.lang["modal.undo.parentpages"])}let r=null;r=i?$("<div />").append($("<p />").text(n),$("<div />",{class:"form-check"}).append($("<input />",{type:"checkbox",id:"undo-recursive",class:"form-check-input"}),$("<label />",{class:"form-check-label",for:"undo-recursive"}).text(TYPO3.lang["modal.undo.recursive"]))):$("<p />").text(n),Modal.advanced({title:TYPO3.lang["modal.undo.header"],content:r,severity:SeverityEnum.ok,staticBackdrop:!0,buttons:[{text:TYPO3.lang["button.cancel"],btnClass:"btn-default",trigger:function(){Modal.dismiss()}},{text:TYPO3.lang["button.undo"],btnClass:"btn-success",action:new DeferredAction((()=>{this.callAjaxAction("undo","object"==typeof s?s:[s],a,r.find("#undo-recursive").prop("checked"))}))}]})},DocumentService.ready().then((()=>{this.initialize()}))}static refreshPageTree(){top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}getElements(){this.elements={$searchForm:$(RecyclerIdentifiers.searchForm),$searchTextField:$(RecyclerIdentifiers.searchText),$searchSubmitBtn:$(RecyclerIdentifiers.searchSubmitBtn),$depthSelector:$(RecyclerIdentifiers.depthSelector),$tableSelector:$(RecyclerIdentifiers.tableSelector),$recyclerTable:$(RecyclerIdentifiers.recyclerTable),$tableBody:$(RecyclerIdentifiers.recyclerTable).find("tbody"),$paginator:$(RecyclerIdentifiers.paginator),$reloadAction:$(RecyclerIdentifiers.reloadAction),$massUndo:$(RecyclerIdentifiers.massUndo),$massDelete:$(RecyclerIdentifiers.massDelete)}}registerEvents(){this.elements.$searchForm.on("submit",(e=>{e.preventDefault(),""!==this.elements.$searchTextField.val()&&this.loadDeletedElements()})),this.elements.$searchTextField.on("keyup",(e=>{""!==$(e.currentTarget).val()?this.elements.$searchSubmitBtn.removeClass("disabled"):(this.elements.$searchSubmitBtn.addClass("disabled"),this.loadDeletedElements())})),this.elements.$searchTextField.get(0).clearable({onClear:()=>{this.elements.$searchSubmitBtn.addClass("disabled"),this.loadDeletedElements()}}),this.elements.$depthSelector.on("change",(()=>{this.loadAvailableTables().then((()=>{this.loadDeletedElements()}))})),this.elements.$tableSelector.on("change",(()=>{this.paging.currentPage=1,this.loadDeletedElements()})),new RegularEvent("click",this.undoRecord).delegateTo(document,RecyclerIdentifiers.undo),new RegularEvent("click",this.deleteRecord).delegateTo(document,RecyclerIdentifiers.delete),this.elements.$reloadAction.on("click",(e=>{e.preventDefault(),this.loadAvailableTables().then((()=>{this.loadDeletedElements()}))})),this.elements.$paginator.on("click","[data-action]",(e=>{e.preventDefault();const t=$(e.currentTarget);let a=!1;switch(t.data("action")){case"previous":this.paging.currentPage>1&&(this.paging.currentPage--,a=!0);break;case"next":this.paging.currentPage<this.paging.totalPages&&(this.paging.currentPage++,a=!0);break;case"page":this.paging.currentPage=parseInt(t.find("span").text(),10),a=!0}a&&this.loadDeletedElements()})),TYPO3.settings.Recycler.deleteDisable?this.elements.$massDelete.remove():this.elements.$massDelete.show(),new RegularEvent("multiRecordSelection:checkbox:state:changed",this.handleCheckboxStateChanged).bindTo(document),new RegularEvent("multiRecordSelection:action:massundo",this.undoRecord).bindTo(document),new RegularEvent("multiRecordSelection:action:massdelete",this.deleteRecord).bindTo(document)}initialize(){NProgress.configure({parent:".module-loading-indicator",showSpinner:!1}),this.getElements(),this.registerEvents(),TYPO3.settings.Recycler.depthSelection>0?this.elements.$depthSelector.val(TYPO3.settings.Recycler.depthSelection).trigger("change"):this.loadAvailableTables().then((()=>{this.loadDeletedElements()}))}resetMassActionButtons(){this.markedRecordsForMassAction=[],this.elements.$massUndo.find("span.text").text(TYPO3.lang["button.undo"]),this.elements.$massDelete.find("span.text").text(TYPO3.lang["button.delete"]),document.dispatchEvent(new CustomEvent("multiRecordSelection:actions:hide"))}loadAvailableTables(){return NProgress.start(),this.elements.$tableSelector.val(""),this.paging.currentPage=1,new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).withQueryArguments({action:"getTables",startUid:TYPO3.settings.Recycler.startUid,depth:this.elements.$depthSelector.find("option:selected").val()}).get().then((async e=>{const t=await e.resolve(),a=[];this.elements.$tableSelector.children().remove();for(let e of t){const t=e[0],s=e[1],n=(e[2]?e[2]:TYPO3.lang.label_allrecordtypes)+" ("+s+")";a.push($("<option />").val(t).text(n))}return a.length>0&&(this.elements.$tableSelector.append(a),""!==TYPO3.settings.Recycler.tableSelection&&this.elements.$tableSelector.val(TYPO3.settings.Recycler.tableSelection)),e})).finally((()=>NProgress.done()))}loadDeletedElements(){return NProgress.start(),this.resetMassActionButtons(),new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).withQueryArguments({action:"getDeletedRecords",depth:this.elements.$depthSelector.find("option:selected").val(),startUid:TYPO3.settings.Recycler.startUid,table:this.elements.$tableSelector.find("option:selected").val(),filterTxt:this.elements.$searchTextField.val(),start:(this.paging.currentPage-1)*this.paging.itemsPerPage,limit:this.paging.itemsPerPage}).get().then((async e=>{const t=await e.resolve();return this.elements.$tableBody.html(t.rows),this.buildPaginator(t.totalItems),e})).finally((()=>NProgress.done()))}callAjaxAction(e,t,a,s=!1){let n={records:t,action:""},i=!1;if("undo"===e)n.action="undoRecords",n.recursive=s?1:0,i=!0;else{if("delete"!==e)return null;n.action="deleteRecords"}return NProgress.start(),new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).post(n).then((async e=>{const t=await e.resolve();return t.success?Notification.success("",t.message):Notification.error("",t.message),this.paging.currentPage=1,this.loadAvailableTables().then((()=>{this.loadDeletedElements(),a&&this.resetMassActionButtons(),i&&Recycler.refreshPageTree()})),e}))}createMessage(e,t){return void 0===e?"":e.replace(/\{([0-9]+)\}/g,(function(e,a){return t[a]}))}buildPaginator(e){if(0===e)return void this.elements.$paginator.contents().remove();if(this.paging.totalItems=e,this.paging.totalPages=Math.ceil(e/this.paging.itemsPerPage),1===this.paging.totalPages)return void this.elements.$paginator.contents().remove();const t=$("<ul />",{class:"pagination"}),a=[],s=$("<li />",{class:"page-item"}).append($("<button />",{class:"page-link",type:"button","data-action":"previous"}).append($("<typo3-backend-icon />",{identifier:"actions-arrow-left-alt",size:"small"}))),n=$("<li />",{class:"page-item"}).append($("<button />",{class:"page-link",type:"button","data-action":"next"}).append($("<typo3-backend-icon />",{identifier:"actions-arrow-right-alt",size:"small"})));1===this.paging.currentPage&&s.disablePagingAction(),this.paging.currentPage===this.paging.totalPages&&n.disablePagingAction();for(let e=1;e<=this.paging.totalPages;e++){const t=$("<li />",{class:"page-item"+(this.paging.currentPage===e?" active":"")});t.append($("<button />",{class:"page-link",type:"button","data-action":"page"}).append($("<span />").text(e))),a.push(t)}t.append(s,a,n),this.elements.$paginator.html(t)}}$.fn.disablePagingAction=function(){$(this).addClass("disabled").find("button").prop("disabled",!0)};export default new Recycler;