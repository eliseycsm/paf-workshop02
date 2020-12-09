import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from './form.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'form';
  form: FormGroup
  result: [] = []

  constructor(private formSvc: FormService, private fb: FormBuilder){
    this.form = this.fb.group({
      orderId: this.fb.control('', Validators.required)
    })
  }

  async getOrderId(){
    let orderId = this.form.value['orderId']
    console.log("orderId", orderId)
    this.result = await this.formSvc.getOrderIdDetails(orderId)
    console.log(this.result)
  }
}
