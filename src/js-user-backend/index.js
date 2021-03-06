'use strict'
import $ from 'jquery'
window.$ = window.jQuery = $

import dialogPolyfill from 'dialog-polyfill'
import Pikaday from 'pikaday'

import select2 from 'select2'

import pubsub from './_pubsub'
import './mailing-selection'
import './tags'
import './delete-mailings'

const dialogRename = $('.js-dialog-rename')[0]
const dialogDelete = $('.js-dialog-delete')[0]
const dialogTag = $('.js-dialog-add-tag')[0]
const notif = $('#notification')[0]

// https://github.com/GoogleChrome/dialog-polyfill
if (dialogRename && !dialogRename.showModal) {
  dialogPolyfill.registerDialog(dialogRename)
  dialogPolyfill.registerDialog(dialogDelete)
  dialogPolyfill.registerDialog(dialogTag)
}

$(document).on('keyup', e => {
  if (e.keyCode == 27) pubsub('key:escape').publish()
})

//////
// RENAME MAILING
//////

let route = false
let $nameLink = false
let $inputRename = $('#rename-field')

$('.js-rename').on('click', e => {
  e.preventDefault()
  const $target = $(e.currentTarget)
  route = $target.data('href')
  $nameLink = $target.parents('tr').find('.js-name')
  $inputRename.val($nameLink.text())

  // update MDL
  const wrapper = $inputRename.parent()[0]
  componentHandler.downgradeElements(wrapper)
  // strangely componentHandler.downgradeElements doens't remove invalid class
  wrapper.classList.remove('is-invalid')
  componentHandler.upgradeElement(wrapper)
  // show modal
  dialogRename.showModal()
})

$('.js-post').on('click', e => {
  var name = $inputRename.val()
  $.ajax({
    method: 'POST',
    url: route,
    data: {
      name: name,
    },
  })
    .then(mosaicoMailing => {
      $nameLink.text(mosaicoMailing.meta.name)
      notif.MaterialSnackbar.showSnackbar({
        message: window.badesenderI18n.snackbarRenameMessage,
      })
      closeRenameDialog()
    })
    .catch(_ => {
      notif.MaterialSnackbar.showSnackbar({
        message: 'error',
      })
    })
})

$('.js-close-rename-dialog').on('click', closeRenameDialog)

function closeRenameDialog() {
  $nameLink = false
  route = false
  dialogRename.close()
}

//////
// TOGGLE FILTERS
//////

const $filter = $('.js-filter')
$('.js-toggle-filter').on('click', e => $filter.toggleClass('is-visible'))

//////
// PAGINATION
//////

const $paginationSelect = $('.js-pagination')
$paginationSelect.on('change', e => {
  window.location.assign($paginationSelect.val())
})

//////
// COMPONENTS
//////

//----- SELECT2

// https://select2.github.io/options.html

$('select[multiple]').each((index, el) => {
  const $select = $(el)
  const $wrapper = $select.parent()
  const wrapper = $wrapper[0]

  $select
    .select2({
      width: '100%',
    })
    .on('change', updateMDL)

  function updateMDL() {
    componentHandler.downgradeElements(wrapper)
    componentHandler.upgradeElements(wrapper)
  }
})

//----- DATEPICKER

// https://www.npmjs.com/package/pikaday

const pickers = []

$('input[type="date"]').each((index, el) => {
  const $input = $(el)
  const $wrapper = $input.parent().addClass('js-calendar')
  const wrapper = $wrapper[0]
  // Pikaday doesn't work well with a type date
  $input.attr('type', 'text')
  const picker = new Pikaday({
    field: el,
    i18n: window.badesenderI18n.pikaday,
    firstDay: 1,
    onSelect: date => {
      // set value & update MDL
      componentHandler.downgradeElements(wrapper)
      $input.val(picker.toString('YYYY-MM-DD'))
      componentHandler.upgradeElements(wrapper)
    },
  })
  pickers.push(picker)
})
