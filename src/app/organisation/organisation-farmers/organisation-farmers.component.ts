import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, ConfirmDialogService, ExcelServicesService, OrganisationService} from '../../core/services';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {Farmer} from '../../core/models';
import {FarmerDetailsComponent} from '../../farmer/farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService} from '../../core/services';
import {LocationService} from '../../core/services';

@Component({
  selector: 'app-organisation-farmers',
  templateUrl: './organisation-farmers.component.html',
  styleUrls: ['./organisation-farmers.component.css']
})
export class OrganisationFarmersComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private route: ActivatedRoute, private  confirmDialogService: ConfirmDialogService,
              private modal: NgbModal, private authorisationService: AuthorisationService,
              private locationService: LocationService) {
  }

  message: string;
  farmers: any;
  organisationId: string;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  isUserCWSOfficer = true;
  org: any;
  numberOfTrees = 0;
  numberOfFarmers = 0;
  currentSeason: any;
  orgCoveredArea = [];
  allFarmers = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.getFarmers(this.organisationId);
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
      const orgSectors = [];
      const orgCells = [];
      const orgVillages = [];
      this.org.coveredSectors.map((sector) => {
        orgSectors.push(sector.sectorId);
        sector.coveredCells.map((cell) => {
          orgCells.push(cell.cell_id);
        });
        sector.coveredVillages.map((village) => {
          orgVillages.push(village.village_id);
        });
      });
      this.locationService.getSectors(this.org.location.dist_id._id).subscribe((secs) => {
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
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.getAllFarmers();
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.allFarmers, 'farmers');
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getFarmers(orgId: string): void {
    this.loading = true;
    this.organisationService.getOrgFarmers(orgId).subscribe(data => {
      if (data) {
        this.farmers = data.content;
        this.farmers.map((farmer) => {
          farmer.request.requestInfo.map(land => {
            this.numberOfTrees = this.numberOfTrees + land.numberOfTrees;
          });
        });
        this.numberOfFarmers = this.farmers.length;
        this.dtTrigger.next();
        this.loading = false;
      }
    });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  getAllFarmers() {
    this.organisationService.getAllFarmers(this.organisationId)
      .subscribe(data => {
        data.content.map((item) => {
          const temp = {
            NAMES: item.userInfo.surname + '  ' + item.userInfo.foreName,
            SEX: item.userInfo.sex,
            NID: item.userInfo.NID,
            PHONE: item.userInfo.phone_number,
            REGNUMBER: item.userInfo.regNumber,
            PROVINCE: item.request.requestInfo[0].location.prov_id.namek,
            DISTRICT: item.request.requestInfo[0].location.dist_id.name,
            SECTOR: item.request.requestInfo[0].location.sect_id.name,
            CELL: item.request.requestInfo[0].location.cell_id.name,
            VILLAGE: item.request.requestInfo[0].location.village_id.name
          };

          this.allFarmers.push(temp);
        });
      });
  }
}
