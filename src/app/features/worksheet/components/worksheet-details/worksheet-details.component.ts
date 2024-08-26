import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { process, State } from '@progress/kendo-data-query';
import { WorksheetService, WorkSheetSO} from '../../worksheet.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Router } from '@angular/router';

interface EnquiryList {
  id: string | number;
  dealNo: string;
  enqID: number;
  soldToLEID: number;
  soldToLE: string;
  salesChannel: string;
  enqStatusId: number;
  enqStatus: string;
  salesExecutiveID: number;
  salesExecutive: string;
  soldToContact: string;
  wsApprovalPendingWith: string;
  soldToContPhoneNo: number;
  approxQuotevalue: number;
  drqStatus: string;
};

@Component({
  selector: 'app-worksheet-details',
  templateUrl: './worksheet-details.component.html',
  styleUrls: ['./worksheet-details.component.scss']
})
export class WorksheetDetailsComponent {
  @Input()
  public worksheetDetails!: FormGroup;
  contactCards: EnquiryList[] = [];
  pageSize = 3;
  filteredCards: any[] = [];
  skip = 0;
  total = 0;
  searchTerm = '';
  public showWorksheetAPILoader = false;
  public worksheetDetailsCard: WorkSheetSO[] =[];

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private worksheetService: WorksheetService
  ){}
  
  ngOnInit() {
    this.loaderService.loaderState.subscribe(res => {
      this.showWorksheetAPILoader = res;
    });
    this.loaderService.hideLoader();
    this.enquiryList();
  }

  enquiryList() {
    this.loaderService.showLoader();
    this.worksheetService.getEnquiryWorksheetlist().subscribe((data: any) => {
      this.contactCards = data;
      this.filterData();
      this.loaderService.hideLoader();
    },
    error => {
      this.loaderService.hideLoader();
    }); 
  }

  filterData(): void {
    this.filteredCards = [...this.contactCards];
    if (this.searchTerm.trim() !== '') {
      this.filteredCards = this.contactCards.filter(
        a =>
          (a.dealNo &&
            a.dealNo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (a.soldToContact &&
            a.soldToContact
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())) ||
          (a.soldToLE &&
            a.soldToLE.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.total = this.filteredCards.length;
    this.applyPagination();
    console.log('enquiry List',this.filteredCards);
  }

  applyPagination(): void {
    const state: State = {
      skip: this.skip,
      take: this.pageSize,
    };
    const processed = process(this.filteredCards, state);
    this.filteredCards = processed.data;
    this.total = processed.total;
  }

  onPageChange(state: State): void {
    this.skip = state.skip as number;
    this.filterData();
  }

  navigateById(enqId: number) {
    this.router.navigate(['/worksheet-approval',enqId]);
  }

  onBackClickHandle() {
    this.router.navigate(['dashboard']);
  }

  onReset(){
    this.ngOnInit();
  }
}
