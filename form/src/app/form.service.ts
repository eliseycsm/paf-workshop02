import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class FormService{
    //add headers
    
    //constructor
    constructor(private http: HttpClient){}

    //get order details from db
    getOrderIdDetails(orderId: string): Promise<any>{
        return this.http.get(`http://localhost:3000/order/total/${orderId}`).toPromise()
            .catch(e =>  console.error("Error from db retrieval", e))
    }
    

}