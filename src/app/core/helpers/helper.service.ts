import {Injectable} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {LocationService} from '../services';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private locationService: LocationService) {
  }

  getFormValidationErrors(form) {
    const errors = [];
    Object.keys(form.controls).forEach(key => {

      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          errors.push(key + ' field is ' + keyError);
        });
      }
    });
    return errors;
  }

  cleanObject(obj) {
    for (const propName in obj) {
      if (obj[propName] === '' || obj[propName] === undefined || obj[propName] === null) {
        delete obj[propName];
      }
    }
  }

  getProvinceName(id: string) {
    this.locationService.getProvinces().subscribe((data) => {
      data = data.filter((element) => {
        return element._id === id;
      });
      return data[0].namek;
    });
  }

  getDistrictName(id: string, district: string) {
    return this.locationService.getDistricts(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === district;
      });
      return data[0].name;
    });

  }

  getSectorName(id: string, sector: string) {
    return this.locationService.getSectors(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === sector;
      });
      return data[0].name;
    });

  }

  getCellName(id: string, cell: string) {
    return this.locationService.getCells(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === cell;
      });
      return data[0].name;
    });
  }

  getVillageName(id: string, village: string) {
    return this.locationService.getVillages(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === village;
      });
      return data[0].name;
    });
  }
}
