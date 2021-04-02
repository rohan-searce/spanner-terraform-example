import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SnackBarService } from '../../services/snackbar.service';
import { FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { RestService } from '../../services/rest.service';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})

export class SimulationComponent implements OnInit {

  displayedColumns: string[] = ['companyName', 'companyShortCode', 'status', 'action'];
  dataSource: MatTableDataSource<SimuationData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  searchInput: String;
  companies: any;
  simulateForm: any;
  simulations: any;
  interval = [5, 10, 15];
  noOfRecords = [50, 100, 150, 200];
  loader: boolean = false;
  runningSimulation = 0;
  maxAllowedSimulation = 3;

  constructor(private snackBarService: SnackBarService, private restService: RestService, private formBuilder: FormBuilder, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getCompanies();
    this.simulateForm = this.formBuilder.group({
      companyId: ['', [Validators.required]],
      timeInterval: ['', [Validators.required]],
      data: ['', [Validators.required]],
    });
    this.getSimulations();
  }

  initializeSortAndPagination() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getCompanies() {
    this.restService.getData('companies/list')
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.companies = response.data;
          }
        },
        error => {
          if (error && error.error && error.error.message) {
            this.snackBarService.openSnackBar(error.error.message, '');
          }
        });
  }

  deleteSimulation(simulation) {
    const dialogData = new ConfirmDialogModel("Confirm Action", `Are you sure you want to delete simulation for  ${simulation.companyName}?`);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(dialogResult => {
      if (dialogResult === true) {
        this.restService.deleteData(`simulations/delete/${simulation.sId}`)
          .pipe(take(1))
          .subscribe(
            response => {
              if (response && response.success) {
                this.snackBarService.openSnackBar(response.message, '');
                const index = this.dataSource.data.findIndex(simulationObj => simulationObj.sId === simulation.sId);
                if (index > -1) {
                  this.dataSource.data.splice(index, 1)
                  this.dataSource = new MatTableDataSource(this.dataSource.data);
                  this.runningSimulation = this.dataSource.data.length;
                  this.initializeSortAndPagination();
                }
                this.updateCompanyStatus(simulation.companyId);
              }
              this.loader = false;
            }, error => {
              if (error && error.error && error.error.message) {
                this.snackBarService.openSnackBar(error.error.message, '');
              }
              this.loader = false;
            }
          );
      }
    });
  }

  simulate(formDirective: FormGroupDirective) {
    if(this.runningSimulation >= this.maxAllowedSimulation){
      this.snackBarService.openSnackBar(`Cannot simulate more than ${this.maxAllowedSimulation} simulations`, '');
      return false;
    }
    this.loader = true;
    this.restService.postData('simulations/start', this.simulateForm.value)
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.updateCompanyStatus(this.simulateForm.get('companyId').value, true);
            this.simulateForm.reset();
            formDirective.resetForm();
            this.getSimulations();
          }
          this.loader = false;
        },
        error => {
          if (error && error.error && error.error.message) {
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        });
  }

  getSimulations() {
    this.loader = true;
    this.restService.getData('simulations/list')
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.runningSimulation = response.data.length;
            console.log(this.runningSimulation);
            this.dataSource = new MatTableDataSource(response.data);
            this.initializeSortAndPagination();
            if (response.data && response.data.length > 0) {
              for (var i = 0; i < response.data.length; i++) {
                this.updateCompanyStatus(response.data[i].companyId, true)
              }
            }
          }
          this.loader = false;
        },
        error => {
          if (error && error.error && error.error.message) {
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        });
  }

  updateSimulation(simulation) {
    this.loader = true;
    const payLoad = { sId: simulation.sId, status: (simulation.status) ? false : true }
    this.restService.putData(`simulations/update`, payLoad)
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.getSimulations();
            this.snackBarService.openSnackBar(response.message, '');
          }
          this.loader = false;
        },
        error => {
          if (error && error.error && error.error.message) {
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        });

  }

  updateCompanyStatus(id: string, value: boolean = false) {
    if (id) {
      const index = this.companies.findIndex(company => company.companyId === id);
      if (index > -1) {
        this.companies[index].isAlreadyStarted = value;
      }
    }
  }

  applyFilter() {
    this.dataSource.filter = this.searchInput.trim().toLowerCase();
  }

}

export interface SimuationData {
  sId: string;
  companyName: string;
  companyShortCode: string;
  status: boolean;
  companyId: String;
}



