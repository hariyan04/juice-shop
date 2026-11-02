/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit } from '@angular/core'
import { UntypedFormControl, Validators } from '@angular/forms'
import { ImageCaptchaService } from '../Services/image-captcha.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss']
})
export class DataExportComponent implements OnInit {
  public captchaControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(5)])
  public formatControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public captcha: any
  private dataRequest: any = undefined
  public confirmation: any
  public error: any
  public lastSuccessfulTry: any
  public presenceOfCaptcha: boolean = false
  public userData: any

  constructor (public sanitizer: DomSanitizer, private readonly imageCaptchaService: ImageCaptchaService, private readonly dataSubjectService: DataSubjectService) { }
  ngOnInit () {
    this.needCaptcha()
    this.dataRequest = {}
  }

  needCaptcha () {
    const nowTime = new Date()
    const timeOfCaptcha = localStorage.getItem('lstdtxprt') ? new Date(JSON.parse(String(localStorage.getItem('lstdtxprt')))) : new Date(0)
    if (nowTime.getTime() - timeOfCaptcha.getTime() < 300000) {
      this.getNewCaptcha()
      this.presenceOfCaptcha = true
    }
  }

  getNewCaptcha () {
    this.imageCaptchaService.getCaptcha().subscribe((data: any) => {
      this.captcha = this.sanitizer.bypassSecurityTrustHtml(data.image)
    })
  }

  save () {
    if (this.presenceOfCaptcha) {
      this.dataRequest.answer = this.captchaControl.value
    }
    this.dataRequest.format = this.formatControl.value
    this.dataSubjectService.dataExport(this.dataRequest).subscribe((data: any) => {
      this.error = null
      this.confirmation = data.confirmation
      this.userData = data.userData
      const w = window.open('', '_blank', 'width=500')
      if (w) {
        // Create a safe container and set textContent so userData is not interpreted as HTML/JS
        w.document.open()
        w.document.write('<!doctype html><html><head><meta charset="utf-8"></head><body><pre></pre></body></html>')
        const pre = w.document.querySelector('pre')
        if (pre) pre.textContent = this.userData
        w.document.close()
      }
      this.lastSuccessfulTry = new Date()
      localStorage.setItem('lstdtxprt', JSON.stringify(this.lastSuccessfulTry))
      this.ngOnInit()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      this.resetFormError()
    })
  }

  resetForm () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
    this.formatControl.markAsUntouched()
    this.formatControl.markAsPristine()
    this.formatControl.setValue('')
  }

  resetFormError () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }
}
