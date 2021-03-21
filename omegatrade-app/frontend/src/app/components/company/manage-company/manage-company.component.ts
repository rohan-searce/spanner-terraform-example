import { Component, ViewChild } from '@angular/core';
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

export class ManageCompanyComponent {
  displayedColumns: string[] = ['companyName', 'companyShortCode', 'action'];
  dataSource: MatTableDataSource<CompanyData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  response: any;
  loader: boolean = false;

  constructor(private snackBarService: SnackBarService, private restService: RestService, public dialog: MatDialog) {
    this.getCompanies();
  }

  getCompanies() {
    this.loader = true;
    this.restService.getData('companies/list')
    .pipe(take(1))
    .subscribe(response => {
      this.response = response;
      if (this.response && this.response.success) {
        this.dataSource = new MatTableDataSource(this.response.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      this.loader = false;
    },
    error => {
      this.loader = false;
      this.snackBarService.openSnackBar(error.error.message, '');
    });
  }

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

  openCompanyDialog(row = null): void {
    const dialogRef = this.dialog.open(UpdateCompanyComponent, {
      width: '400px',
      data: row
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response && response.success) {
        this.getCompanies()
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  
}

export interface CompanyData {
  companyId: string;
  companyName: string;
  companyShortCode: string;
}
