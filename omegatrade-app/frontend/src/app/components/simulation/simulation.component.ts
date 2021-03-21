import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SnackBarService } from '../../services/snackbar.service';
import { FormBuilder, Validators } from '@angular/forms';
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

  companies: any;
  simulateForm: any;
  time = [5, 10, 15, 30, 60];
  datas = [100, 200, 400, 600];
  loader: boolean = false;
  simulations: any;
  constructor(private snackBarService: SnackBarService, private restService: RestService, private formBuilder: FormBuilder) {
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
          this.snackBarService.openSnackBar(error.error.message, '');
        });
  }

  deleteSimulation(row) {
    this.restService.deleteData(`simulations/delete/${row.sId}`)
      .subscribe(
        response => {
          if (response && response.success) {
            this.snackBarService.openSnackBar(response.message, '');
            this.getSimulations();
          }
          this.loader = false;
        }, error => {
          this.snackBarService.openSnackBar(error.error.message, '');
        }
      );
  }

  simulate() {
    this.loader = true;
    this.restService.postData('simulations/start', this.simulateForm.value)
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.getSimulations();
          }
          this.loader = false;
        },
        error => {
          this.snackBarService.openSnackBar(error.error.message, '');
          this.loader = false;

        });
  }

  getSimulations() {
    this.loader = true;
    this.restService.getData('simulations/list')
      .subscribe(
        response => {
          if (response && response.success) {
            this.simulations = response.data;
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          this.loader = false;
        },
        error => {
          this.snackBarService.openSnackBar(error.error.message, '');
          this.loader = false;
        });
  }

  updateSimulation(params) {
    this.loader = true;
    const payLoad = { sId: params.sId, status: (params.status) ? false : true }
    this.restService.putData('simulations/update', payLoad)
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
          this.snackBarService.openSnackBar(error.error.message, '');
          this.loader = false;
        });

  }

  isAlreadyStarted(id: string) {
    if (this.simulations && this.simulations.find(el => el.companyId === id)) {
      return true;
    }
    return false;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}

export interface SimuationData {
  sID: string;
  companyName: string;
  companyShortCode: string;
  status: boolean;
}



