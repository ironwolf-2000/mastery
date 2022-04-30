import { useState, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Button, Container, Overlay, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { Heatmap, CreateModal } from '../../common';
import { ICreateParams } from '../../common/Forms/Forms.types';
import { IHeatmapCellParams } from '../../common/Heatmap/Heatmap.types';
import { createParamsToHabitParams } from './Habits.helpers';
import { IHabitParams } from './Habits.types';
import { addHabit, getAllHabits } from '../../../services/habits.service';
import { getOverallEntityHeatmap } from '../../../services/entities.service';

import './Habits.scss';

const blk = cn('Habits');

export const Habits = () => {
  const navigate = useNavigate();

  const addButtonRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

  const [habits, setHabits] = useState<IHabitParams[]>([]);
  const [overallHabitsHeatmap, setOverallHabitsHeatmap] = useState<IHeatmapCellParams[][]>([]);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);

  useEffect(() => {
    setHabits(getAllHabits());
    // setOverallHabitsHeatmap(getOverallEntityHeatmap('habit'));
  }, []);

  const handleAddHabit = (params: ICreateParams) => {
    const resp = addHabit(createParamsToHabitParams(params));

    if (resp.success) {
      toast.success(resp.message);
      setHabits(getAllHabits());
      setCreateModalVisible(false);
    } else {
      toast.error(resp.message);
    }
  };

  const addButtonDisabled = habits.length === 7;

  return (
    <>
      <Container className={blk()}>
        <section className={blk('ManageHabitsSection')}>
          <header className={blk('Header')}>
            <span
              ref={addButtonRef}
              onMouseEnter={addButtonDisabled ? () => setTooltipVisible(true) : undefined}
              onMouseLeave={addButtonDisabled ? () => setTooltipVisible(false) : undefined}
            >
              <Button
                className={blk('AddButton')}
                variant='outline-secondary'
                onClick={() => setCreateModalVisible(true)}
                disabled={addButtonDisabled}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </span>
            <Overlay target={addButtonRef.current} show={tooltipVisible} placement='bottom'>
              {props => (
                <Tooltip className={blk('Tooltip')} {...props}>
                  You cannot have more than 7 habits at once.
                </Tooltip>
              )}
            </Overlay>
          </header>
          {habits.length ? (
            <div className={blk('HabitLinksBlock')}>
              {habits.map(habit => {
                const encodedName = encodeURIComponent(habit.name);

                return (
                  <Button
                    key={encodedName}
                    className={blk('HabitLink')}
                    variant='outline-secondary'
                    onClick={() => navigate(`/habits/${encodedName}`)}
                  >
                    {habit.name}
                  </Button>
                );
              })}
            </div>
          ) : (
            "You don't have any habits in progress."
          )}
        </section>
        <section className={blk('HeatmapSection')}>
          <h2 className={blk('HeatmapSectionHeading')}>Overall Progress</h2>
          <Heatmap
            heatmapState={overallHabitsHeatmap}
            bgColor='var(--color-rgb-habits)'
            cellSize='m'
          />
        </section>
      </Container>
      <CreateModal
        type='habit'
        title='Create a new habit'
        visible={createModalVisible}
        handleCancel={() => setCreateModalVisible(false)}
        handleCreate={handleAddHabit}
      />
      <ToastContainer autoClose={2000} position='bottom-right' />
    </>
  );
};
