import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      //orderId: this.fb.control('', Validators.required),
      orderIdArr: this.fb.array([ this.createOrderQuery() ]) //create FormArray to store multiple input fields & their controls
    })
  }

  async getOrderId(){
    let orderId = this.form.value['orderId']
    console.log("orderId", orderId)
    this.result = await this.formSvc.getOrderIdDetails(orderId)
    console.log(this.result)
  }

 async getOrderIds(){//retrieve from multiple inputs
    let orderIds = this.form.get('orderIdArr').value
    orderIds = orderIds.map(e=> e.orderId)
    console.log("orderIds", orderIds) 

    let ordersRequested = orderIds
    this.result = await this.formSvc.getMultipleOrderDetails(orderIds)
    console.log(this.result)

  }

  createOrderQuery() {
    return this.fb.group({
      orderId: this.fb.control('', Validators.required)
    })
  }
  addOrderQuery(){
    const orderArr = this.form.get("orderIdArr") as FormArray
    orderArr.push(this.createOrderQuery())
    console.log("formArray: ", orderArr)
  }
}
