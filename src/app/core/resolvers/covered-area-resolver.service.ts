import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {OrganisationService} from '../services';
import {LocationService} from '../services';

@Injectable({
  providedIn: 'root'
})
export class CoveredAreaResolverService implements Resolve<any> {

  organisationId: string;
  orgCoveredArea = [];

  constructor(private organisationService: OrganisationService, private locationService: LocationService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    this.orgCoveredArea = [];
    this.organisationId = route.paramMap.get('organisationId');
    this.organisationService.get(this.organisationId).subscribe(data => {
      const org = data.content;
      const orgSectors = [];
      const orgCells = [];
      const orgVillages = [];
      org.coveredSectors.map((sector) => {
        orgSectors.push(sector.sectorId._id);
        sector.coveredCells.map((cell) => {
          orgCells.push(cell.cell_id);
        });
        sector.coveredVillages.map((village) => {
          orgVillages.push(village.village_id);
        });
      });
      this.locationService.getSectors(org.location.dist_id._id).subscribe((secs) => {
        const sectorIds = [];
        secs.map((sec) => {
          if (orgSectors.includes(sec._id)) {
            sectorIds.push(sec._id);
            this.orgCoveredArea.push(sec);
            this.locationService.getCells(sec._id).subscribe((cells) => {
              this.orgCoveredArea[sectorIds.indexOf(sec._id)]['covCells'.toString()] = [];
              const cellIds = [];
              cells.map((cell) => {
                if (orgCells.includes(cell._id)) {
                  cellIds.push(cell._id);
                  this.orgCoveredArea[sectorIds.indexOf(sec._id)]['covCells'.toString()].push(cell);
                  this.locationService.getVillages(cell._id).subscribe((villages) => {
                    this.orgCoveredArea[sectorIds.indexOf(sec._id)]['covCells'.toString()][cellIds.indexOf(cell._id)]
                      ['covVillages'.toString()] = [];
                    villages.map((village) => {
                      if (orgVillages.includes(village._id)) {
                        this.orgCoveredArea[sectorIds.indexOf(sec._id)]['covCells'.toString()][cellIds.indexOf(cell._id)]
                          ['covVillages'.toString()].push(village);
                      }
                    });
                  });
                }
              });
            });
          }
        });
      });
    });
    return this.orgCoveredArea;
  }
}
