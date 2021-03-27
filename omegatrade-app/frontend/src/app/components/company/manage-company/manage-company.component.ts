import { Component, ViewChild, OnInit ,AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCompanyComponent } from '../update-company/update-company.component';
import { RestService } from '../../../services/rest.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { take } from "rxjs/operators";

@Component({
  selector: 'app-manage-company',
  templateUrl: './manage-company.component.html',
  styleUrls: ['./manage-company.component.css']
})

export class ManageCompanyComponent implements OnInit , AfterViewInit{
  displayedColumns: string[] = ['companyName', 'companyShortCode', 'action'];
  dataSource: MatTableDataSource<CompanyData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  searchInput:String;

  companies: any;
  loader: boolean = false;

  constructor(private snackBarService: SnackBarService, private restService: RestService, public dialog: MatDialog) {
  }

  /**
  *  Function to Initiate component.
  */
  ngOnInit(): void {
    this.getCompanies();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  

  /**
   * Function to get the company List.
   * 
   * return {null}
   */
  getCompanies() {
    this.loader = true;
    this.restService.getData('companies/list')
      .pipe(take(1))
      .subscribe(response => {
        this.companies = response;
        if (this.companies && this.companies.success) {
          this.dataSource = new MatTableDataSource(this.companies.data);
        }
        this.loader = false;
      },
        error => {
          this.loader = false;
          if(error && error.error && error.error.message){
            this.snackBarService.openSnackBar(error.error.message, '');
          }
        });
  }

  /**
   * Function to delete a company.
   * 
   * return {null}
   */
  deleteCompany(row) {
    if (confirm(`Are you sure you want to delete ${row.companyName}`)) {
      this.loader = true;
      this.restService.deleteData(`companies/delete/${row.companyId}`)
        .pipe(take(1))
        .subscribe(response => {
          if (response && response.success) {
            this.snackBarService.openSnackBar(response.message, '');
            this.getCompanies();
          }
          this.loader = false;
        },
          error => {
            this.loader = false;
            this.snackBarService.openSnackBar(error.error.message, '');
          });
    }
  }

  /**
   * Function to open create/edit company dialog
   * @param row contains company object
   */
  openCompanyDialog(row = null): void {
    const dialogRef = this.dialog.open(UpdateCompanyComponent, {
      width: '400px',
      data: row
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(response => {
      if (response && response.success) {
        this.getCompanies()
      }
    });
  }

  /**
   * Function to filter the companies based on user input
   * 
   */
  applyFilter() {
    this.dataSource.filter = this.searchInput.trim().toLowerCase();
  }

}

export interface CompanyData {
  companyId: string;
  companyName: string;
  companyShortCode: string;
}
