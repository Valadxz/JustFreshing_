import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'descuento'
})
export class DescuentoPipe implements PipeTransform {

  transform(value: any, ...args: any[] ): unknown {
    let descuento = Math.round(value - (value*args[0]/100)).toLocaleString("es-MX");
    
    return descuento ;
  }

}
