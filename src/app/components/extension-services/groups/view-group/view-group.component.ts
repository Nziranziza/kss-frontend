import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicComponent, GroupService, MessageService } from 'src/app/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-view-group',
  templateUrl: './view-group.component.html',
  styleUrls: ['./view-group.component.css'],
})
export class ViewGroupComponent
  extends BasicComponent
  implements OnInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private groupService: GroupService,
    private messageService: MessageService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal, { size: 'lg' });
    }
  }
  closeResult = '';
  groupDetails: any;
  modal: NgbActiveModal;
  @Input() id: string;
  @ViewChild('genderChart ', { static: false }) genderChart;

  results: any[] = [];
  weekDays: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  gaps: any;
  loading = false;
  dataReturned: any[] = [];
  totalByGender: any = {
    maleTotal: 0,
    femaleTotal: 0,
    maleYouthTotal: 0,
    femaleYouthTotal: 0,
    maleOldTotal: 0,
    femaleOldTotal: 0,
  };

  graph = {
    type: ChartType.PieChart,
    data: [
      ['Female', 0],
      ['Male', 0],
    ],
    dummyData: [
      ['Female', 50],
      ['Male', 50],
    ],
    options: {
      colors: ['#FF69F6', '#35A1FF'],
      legend: { position: 'none' },
      pieHole: 0.3,
      pieSliceTextStyle: {
        color: 'black',
      },

      labels: {
        display: false // not working
      },
      backgroundColor: { fill: 'transparent' },
      chartArea: {
        left: 20,
        top: 10,
        bottom: 10,
        width: '80%',
        height: '150',
      },
    },
    columnNames: ['female', 'male'],
    width: '80%',
    height: 160,

  };

  ngOnDestroy(): void { }

  ngOnInit() {
    this.getVisits();
    this.setMessage(this.messageService.getMessage());
  }

  getVisits() {
    this.groupService.get(this.id).subscribe((data) => {
      this.groupDetails = data.data;
      this.groupDetails.members.forEach((member) => {
        member.nid
          ? (member.age = new Date().getFullYear() - member.nid.substring(1, 5))
          : (member.age = '-');
        if (member.sex === 'm' || member.sex === 'M') {
          this.totalByGender.maleTotal += 1;
          if (member.age <= 30) {
            this.totalByGender.maleYouthTotal += 1;
          }
        } else {
          this.totalByGender.femaleTotal += 1;
          if (member.age <= 30) {
            this.totalByGender.femaleYouthTotal += 1;
          }
        }
      });
      this.graph.data = [];
      this.graph.data.push(['Female', (this.totalByGender.femaleTotal * 100) /
        (this.totalByGender.maleTotal + this.totalByGender.femaleTotal)], ['male', (this.totalByGender.maleTotal * 100) /
          (this.totalByGender.maleTotal + this.totalByGender.femaleTotal)]);
      this.totalByGender.maleOldTotal =
        this.totalByGender.maleTotal - this.totalByGender.maleYouthTotal;
      this.totalByGender.femaleOldTotal =
        this.totalByGender.femaleTotal - this.totalByGender.femaleYouthTotal;
    });
  }
}
