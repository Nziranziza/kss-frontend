import {FormGroup} from '@angular/forms';
import {LocationService, OrganisationService} from '../services';

export abstract class BasicComponent {
  errors: any;
  message: string;
  loading = false;
  warning: string;
  locationProvinces = null;
  locationDistricts = null;
  locationSectors = null;
  locationCells = null;
  locationVillages = null;
  basicOrg: any;
  basicCoveredSectors: any;
  basicCoveredCells: any;
  basicCoveredVillages: any;

  protected constructor(protected basicLocationService?: LocationService, protected basicOrganisationService?: OrganisationService) {
  }

  setError(errors: any) {
    this.errors = errors;
    this.message = undefined;
    this.loading = false;
    this.warning = undefined;

    $(() => {
      $('.custom-error').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });

    $(() => {
      $('.custom-error').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 10000;
        setTimeout(() => {
          $element.hide();
          this.clear();
        }, timeout);
      });
    });
  }

  setWarning(warning: any) {
    this.errors = undefined;
    this.message = undefined;
    this.loading = false;
    this.warning = warning;
    $(() => {
      $('.custom-warning').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });
    $(() => {
      $('.custom-warning').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 7500;
        setTimeout(() => {
          $element.hide();
          this.clear();
        }, timeout);
      });
    });
  }

  setMessage(message: any) {
    this.errors = undefined;
    this.message = message;
    this.loading = false;
    this.warning = undefined;
    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });
    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 7500;
        setTimeout(() => {
          $element.hide();
          this.clear();
        }, timeout);
      });
    });
  }

  clear() {
    this.errors = undefined;
    this.message = undefined;
    this.warning = undefined;
    this.loading = false;
  }

  filterZoningSectors(orgCoverage: any) {
    const temp = [];
    orgCoverage.map((sector) => {
      temp.push({
        _id: sector.sectorId._id,
        name: sector.sectorId.name
      });
    });
    return  temp;
  }

  filterZoningCells(orgCoverage: any, id: string) {
    const temp = [];
    const i = orgCoverage.findIndex(element => element.sectorId._id === id);
    const sector = orgCoverage[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    return temp;
  }

  filterZoningVillages(orgCoverage: any, sectId: any, villages: any) {
    const temp = [];
    const i = orgCoverage.findIndex(element => element.sectorId._id === sectId);
    const sector = orgCoverage[i];
    sector.coveredVillages.map((village) => {
      if (villages.findIndex(el => el._id === village.village_id) !== -1) {
        temp.push({
          _id: village.village_id,
          name: village.name
        });
      }
    });
    return temp;
  }

  locationChangeProvince(form: FormGroup, value: string) {
    if (value !== '') {
      this.basicLocationService.getDistricts(form.controls.location.get('prov_id'.toString()).value).subscribe((data) => {
        this.locationDistricts = data;
        this.locationSectors = null;
        this.locationCells = null;
        this.locationVillages = null;
      });
    } else {
      this.locationDistricts = null;
      this.locationSectors = null;
      this.locationCells = null;
      this.locationVillages = null;
    }
  }

  locationChangDistrict(form: FormGroup, value: string) {
    if (value !== '') {
      this.basicLocationService.getSectors(form.controls.location.get('dist_id'.toString()).value).subscribe((data) => {
        this.locationSectors = data;
        this.locationCells = null;
        this.locationVillages = null;
      });
    } else {
      this.locationSectors = null;
      this.locationCells = null;
      this.locationVillages = null;
    }
  }

  locationChangSector(form: FormGroup, value: string) {
    if (value !== '') {
      this.basicLocationService.getCells(form.controls.location.get('sect_id'.toString()).value).subscribe((data) => {
        this.locationCells = data;
        this.locationVillages = null;
      });
    } else {
      this.locationCells = null;
      this.locationVillages = null;
    }
  }

  locationChangCell(form: FormGroup, value: string) {
    if (value !== '') {
      this.basicLocationService.getVillages(form.controls.location.get('cell_id'.toString()).value).subscribe((data) => {
        this.locationVillages = data;
      });
    } else {
      this.locationVillages = null;
    }
  }


  basicInit(orgId?: string) {
    this.basicLocationService.getProvinces().toPromise().then(data => {
      this.locationProvinces = data;
    });
    if (orgId) {
      this.basicOrganisationService.get(orgId).subscribe((data) => {
        this.basicOrg = data.content;
        if (this.basicOrg.coveredSectors) {
          this.basicCoveredSectors = this.filterZoningSectors(this.basicOrg.coveredSectors);
        }
      });
    }
  }

}
