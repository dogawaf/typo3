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
import{SeverityEnum}from"@typo3/backend/enum/severity.js";import $ from"jquery";import{Carousel}from"bootstrap";import{default as Modal}from"@typo3/backend/modal.js";import Severity from"@typo3/backend/severity.js";import Icons from"@typo3/backend/icons.js";class Wizard{constructor(){console.warn("The module `@typo3/backend/wizard.js` has been marked as deprecated and will be removed in TYPO3 v14.0. Consider migrating to `@typo3/backend/multi-step-wizard.js`."),this.setup={slides:[],settings:{},forceSelection:!0,$carousel:null,carousel:null},this.originalSetup=$.extend(!0,{},this.setup)}set(e,t){return this.setup.settings[e]=t,this}addSlide(e,t,s="",i=SeverityEnum.notice,a){const r={identifier:e,title:t,content:s,severity:i,callback:a};return this.setup.slides.push(r),this}addFinalProcessingSlide(e){return e||(e=()=>{this.dismiss()}),Icons.getIcon("spinner-circle",Icons.sizes.large,null,null).then((t=>{const s=$("<div />",{class:"text-center"}).append(t);this.addSlide("final-processing-slide",top.TYPO3.lang["wizard.processing.title"],s[0].outerHTML,Severity.notice,e)}))}show(){const e=this.generateSlides(),t=this.setup.slides[0];Modal.advanced({title:t.title,content:e,severity:t.severity,staticBackdrop:!0,buttons:[{text:top.TYPO3.lang["wizard.button.cancel"],active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{this.getComponent().trigger("wizard-dismiss")}},{text:top.TYPO3.lang["wizard.button.next"],btnClass:"btn-primary",name:"next"}],callback:e=>{this.setup.carousel=new Carousel(e.querySelector(".carousel")),this.addProgressBar(),this.initializeEvents(e)}}),this.setup.forceSelection&&this.lockNextStep(),this.getComponent().on("wizard-visible",(()=>{this.runSlideCallback(t,this.setup.$carousel.find(".carousel-item").first())})).on("wizard-dismissed",(()=>{this.setup=$.extend(!0,{},this.originalSetup)}))}getComponent(){return null===this.setup.$carousel&&this.generateSlides(),this.setup.$carousel}dismiss(){Modal.dismiss()}lockNextStep(){const e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!0),e}unlockNextStep(){const e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!1),e}setForceSelection(e){this.setup.forceSelection=e}initializeEvents(e){const t=this.setup.$carousel.closest(".modal"),s=t.find(".modal-title"),i=t.find(".modal-footer");i.find('button[name="next"]').on("click",(()=>{this.setup.carousel.next()})),this.setup.$carousel.get(0).addEventListener("slide.bs.carousel",(()=>{const e=this.setup.$carousel.data("currentSlide")+1,a=this.setup.$carousel.data("currentIndex")+1;if(s.text(this.setup.slides[a].title),this.setup.$carousel.data("currentSlide",e),this.setup.$carousel.data("currentIndex",a),e>=this.setup.$carousel.data("realSlideCount"))t.find(".modal-header .close").remove(),i.slideUp();else{const t=this.setup.$carousel.data("initialStep")*e,s=top.TYPO3.lang["wizard.progress"].replace("{0}",e).replace("{1}",this.setup.$carousel.data("slideCount"));i.find(".progress").attr("aria-valuenow",t.toString(10)).attr("aria-label",s),i.find(".progress-bar").width(t.toString(10)+"%").text(s)}t.removeClass("modal-severity-"+Severity.getCssClass(this.setup.slides[a-1].severity)).addClass("modal-severity-"+Severity.getCssClass(this.setup.slides[a].severity))})),this.setup.$carousel.get(0).addEventListener("slid.bs.carousel",(e=>{const t=this.setup.$carousel.data("currentIndex"),s=this.setup.slides[t];this.runSlideCallback(s,$(e.relatedTarget)),this.setup.forceSelection&&this.lockNextStep()}));const a=this.getComponent();a.on("wizard-dismiss",this.dismiss),e.addEventListener("typo3-modal-hidden",(()=>{a.trigger("wizard-dismissed")})),e.addEventListener("typo3-modal-shown",(()=>{a.trigger("wizard-visible")}))}runSlideCallback(e,t){"function"==typeof e.callback&&e.callback(t,this.setup.settings,e.identifier)}addProgressBar(){const e=this.setup.$carousel.find(".carousel-item").length,t=Math.max(1,e),s=Math.round(100/t),i=this.setup.$carousel.closest(".modal").find(".modal-footer");if(this.setup.$carousel.data("initialStep",s).data("slideCount",t).data("realSlideCount",e).data("currentIndex",0).data("currentSlide",1),t>1){const e=top.TYPO3.lang["wizard.progress"].replace("{0}","1").replace("{1}",t.toString());i.prepend($("<div />",{class:"progress",role:"progressbar","aria-valuemin":0,"aria-valuenow":s,"aria-valuemax":100,"aria-label":e}).append($("<div />",{class:"progress-bar"}).width(s+"%").text(e)))}}generateSlides(){if(null!==this.setup.$carousel)return this.setup.$carousel;let e='<div class="carousel slide" data-bs-ride="false"><div class="carousel-inner" role="listbox">';for(const t of Object.values(this.setup.slides)){let s=t.content;"object"==typeof s&&(s=s.html()),e+='<div class="carousel-item" data-bs-slide="'+t.identifier+'">'+s+"</div>"}return e+="</div></div>",this.setup.$carousel=$(e),this.setup.$carousel.find(".carousel-item").first().addClass("active"),this.setup.$carousel}}let wizardObject;try{window.opener&&window.opener.TYPO3&&window.opener.TYPO3.Wizard&&(wizardObject=window.opener.TYPO3.Wizard),parent&&parent.window.TYPO3&&parent.window.TYPO3.Wizard&&(wizardObject=parent.window.TYPO3.Wizard),top&&top.TYPO3&&top.TYPO3.Wizard&&(wizardObject=top.TYPO3.Wizard)}catch{}wizardObject||(wizardObject=new Wizard,"undefined"!=typeof TYPO3&&(TYPO3.Wizard=wizardObject));export default wizardObject;