import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { RestService } from '../../../services/rest.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { take } from "rxjs/operators";

@Component({
  selector: 'app-update-company',
  templateUrl: './update-company.component.html',
  styleUrls: ['./update-company.component.css']
})
export class UpdateCompanyComponent implements OnInit {

  companyForm: any;
  loader: boolean = false;

  constructor(private snackBarService: SnackBarService, private restService: RestService, private formBuilder: FormBuilder, private dialogRef: MatDialogRef<UpdateCompanyComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    // Init the company Form
    this.companyForm = this.formBuilder.group({
      companyId: ['', []],
      companyName: ['', [Validators.required]],
      companyShortCode: ['', [Validators.required]],
      created_at: ['']
    });
    if (data && data.companyId) {
      this.companyForm.setValue({
        companyId: data.companyId,
        companyName: data.companyName,
        companyShortCode: data.companyShortCode,
        created_at: data.created_at
      });
      const ctrl = this.companyForm.get('companyShortCode');
      ctrl.disable();
    }
  }

  /**
   * Function to create or update the company
   * 
   */
  submitForm() {
    if (this.companyForm.dirty && this.companyForm.valid) {
      this.loader = true;
      const path = (this.companyForm.get('companyId').value != '') ? 'update' : 'create';
      this.restService.postData(`companies/${path}`, this.companyForm.value)
        .pipe(take(1))
        .subscribe(response => {
          if (response && response.success) {
            this.dialogRef.close(response);
            this.snackBarService.openSnackBar(response.message, '');
          }
          this.loader = false;
        },error => {
            this.loader = false;
            this.snackBarService.openSnackBar(error.error.message, '');
          });
    }
  }

  ngOnInit(): void {
  }

}
