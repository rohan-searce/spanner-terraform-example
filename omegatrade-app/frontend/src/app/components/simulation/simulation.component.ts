import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SnackBarService } from '../../services/snackbar.service';
import { FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { RestService } from '../../services/rest.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})

export class SimulationComponent implements OnInit  {

  displayedColumns: string[] = ['companyName', 'companyShortCode', 'status', 'action'];
  dataSource: MatTableDataSource<SimuationData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  searchInput:String;
  companies: any;
  simulateForm: any;
  simulations: any;
  interval = [5, 10, 15];
  datas = [50, 100, 150, 200];
  loader: boolean = false;
  
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
    this.restService.deleteData(`simulations/delete/${simulation.sId}`)
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.snackBarService.openSnackBar(response.message, '');
            const index = this.dataSource.data.findIndex(simulationObj => simulationObj.sId === simulation.sId);
            if (index > -1){
              this.dataSource.data.splice(index, 1)
              this.dataSource = new MatTableDataSource(this.dataSource.data);
              this.initializeSortAndPagination();
            }
          }
          this.loader = false;
        }, error => {
          if(error && error.error && error.error.message){
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        }
      );
  }

  simulate(formDirective: FormGroupDirective) {
    this.loader = true;
    this.restService.postData('simulations/start', this.simulateForm.value)
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.simulateForm.reset();
            formDirective.resetForm();
            this.getSimulations();
          }
          this.loader = false;
        },
        error => {
          if(error && error.error && error.error.message){
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
            this.dataSource = new MatTableDataSource(response.data);
            this.initializeSortAndPagination();
          }
          this.loader = false;
        },
        error => {
          if(error && error.error && error.error.message){
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        });
  }

  updateSimulation(simulation) {
    this.loader = true;
    const payLoad = { sId: simulation.sId, status: (simulation.status) ? false : true }
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
          if(error && error.error && error.error.message){
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.loader = false;
        });

  }

  isAlreadyStarted(id: string) {
    if (this.simulations && this.simulations.find(simulation => simulation.companyId === id)) {
      return true;
    }
    return false;
  }

  applyFilter() {
    this.dataSource.filter = this.searchInput.trim().toLowerCase();
  }

}

export interface SimuationData {
  sID: string;
  companyName: string;
  companyShortCode: string;
  status: boolean;
}



