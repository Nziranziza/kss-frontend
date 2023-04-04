import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';
import { IntegrationsService } from 'src/app/core/services/integrations.service';
import { AppFormComponent } from './app-form/app-form.component';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.css']
})
export class IntegrationsComponent implements OnInit {

  apps: any[] = []
  constructor(
    private integrationService: IntegrationsService,
    private modal: NgbModal
  ) { }

  ngOnInit(): void {
    this.getIntegrations()
  }

  getIntegrations = () => {
    this.integrationService.getIntegrations().subscribe(({ data }) => {
      this.apps = data;
    })
  }

  openAppForm(app?: any) {
    const modalRef = this.modal.open(AppFormComponent, { size: 'md' });
    modalRef.componentInstance.reload = this.getIntegrations
    modalRef.componentInstance.app = app;
  }

}
